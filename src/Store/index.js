/*jslint node: true*/

"use strict";

var
  State = require('./State'),
  Dispatcher = require('../Dispatcher'),
  EventEmitter = require('events').EventEmitter,
  assign = require('object-assign'),
  clone = require('clone'),
  listenerCounter = 0;

/*
** STORE CONSTRUCTOR
*/
function Store(name, funcObj) {
  var self = this;
  
  this.name = name;
  this.exports = funcObj || {};
  this.states = {};
  this.listeners = [];
  this.emitter = new EventEmitter();

  // Register to dispatcher
  this.dispatcherIndex = Dispatcher.register(function (payload) {
    self.listeners.forEach(function (listener) {
      if (listener.type === payload.type) {
        listener.callback.call(listener.self, payload);
      }
    });
  });
  
  // Generic exports to be used by the view layer
  
  this.exports.getState = function () {
    var key, state = {}, states = self.states;
    for (key in states) {
      if (states.hasOwnProperty(key)) {
        state[key] = states[key].get();
      }
    }
    return state;
  };
  
  this.exports.on = this.emitter.on;
  this.exports.removeListener = this.emitter.removeListener;
}

/*
** STORE DECLARATION API
*/
Store.prototype = {
  
  addState: function (name, type, defaultValue, initializers) {
    var state = new State(name, this.name, type, defaultValue, initializers);
    this.states[name] = state;
    this.exports[name] = state.get.bind(state);
    return this;
  },

  on: function (actionID, callback) {
    this.listeners.push({
      type: actionID,
      callback: callback,
      self: this
    });
    return this;
  },

  removeListener: function (callback) {
    var i;
    for (i = 0; i < this.listeners.length; i += 1) {
      if (this.listeners[i].callback === callback) {
        this.listeners.splice(i, 1);
        return;
      }
    }
    throw new Error("Could not listener callback");
  },

  declare: function (funcName, func) {
    var self = this;
    this.exports[funcName] = function () {
      return clone(func.apply(self, Array.prototype.slice.call(arguments)));
    };
    return this;
  },
  
  setState: function (values) {
    var key, states = this.states, changed = false, changes = {};
    for (key in values) {
      if (values.hasOwnProperty(key)) {
        if (!states[key]) {
          throw new Error("Undeclared state: " + key);
        }
        if (states[key].set(values[key])) {
          changed = true;
          changes[key] = states[key].get();
        }
      }
    }
    if (changed) {
      this.emit("change", changes);
    }
  },
  
  emit: function (event, data) {
    return this.emitter.emit.call(this.exports, event, data);
  }
  
};

/*
** STATIC exports
*/

Store.create = function (name, classDef) {
  return new Store(name, classDef);
};

/*
** EXPORTS
*/

module.exports = Store;
