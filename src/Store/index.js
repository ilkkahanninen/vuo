/*jslint node: true*/

"use strict";

var
  State = require('./State'),
  Dispatcher = require('../Dispatcher'),
  EventEmitter = require('events').EventEmitter,
  assign = require('object-assign'),
  clone = require('clone'),
  listenerCounter = 0;

/**
* @classdesc
* Store holds the application state. It is a little like a model (in MV* and such) but it doesn't have setters.
* It only provides data via getters, listens actions from dispatcher and manages its own state.
* Store class provides automatic state validation and change event emitting.
*
* Store exports a public interface which limits the access to its state.
* This is intentional because we don't want that view layer could accidentally alter
* the state and cause strange side-effects.
*
* Each state has a corresponding getter in exported functions (except if it's protected). Exported functions
* include also few built-in functions:
*
* `getState()` returns all non-protected states at once.
* `on()` adds an event listener.
* `removeListener()` removes an event listener.
*
* @constructor
* @arg {string} name      Store name. CamelCase format is recommended.
* @arg {object} [exports] An object where the functions and identifiers are stored into, e.g. `module.exports`
*/
function Store(name, funcObj) {
  var self = this;

  this.name = name;
  /**
   * Public API of the store (getters).
   * @see {@link Store_exports}
   */
  this.exports = funcObj || {};
  this.states = {};
  this.listeners = [];
  this.emitter = new EventEmitter();
  this.dispatcherIndex = Dispatcher.register(function (payload) {
    self.listeners.forEach(function (listener) {
      if (listener.type === payload.type) {
        listener.callback.call(listener.self, payload);
      }
    });
  });
  
  /**
   * Returns the whole store state
   * @memberof StoreExports
   */
  this.exports.getState = function () {
    var key, state = {}, states = self.states;
    for (key in states) {
      if (states.hasOwnProperty(key)) {
        state[key] = states[key].get();
      }
    }
    return state;
  };
  
  /**
   * Returns the whole store state
   * Adds event listener
   * @memberof StoreExports
   */
  this.exports.on = this.emitter.on;
  this.exports.removeListener = this.emitter.removeListener;
}

/*
** STORE DECLARATION API
*/
Store.prototype = {
  /**
   * Declares a state.
   * @arg {string} name
   * @arg {string} type State type (see xtypejs documentation)
   * @arg {*} defaultValue
   * @arg {array.<function>|function} initializers Initializers
   * @returns {Store}
   */
  addState: function (name, type, defaultValue, initializers) {
    var state = new State(name, this.name, type, defaultValue, initializers);
    this.states[name] = state;
    this.exports[name] = state.get.bind(state);
    return this;
  },

  /**
   * Adds an action listener.
   * @arg {object|string} action
   * @arg {Store~callback} callback
   */
  on: function (action, callback) {
    if (typeof action.toString === 'undefined') {
      throw new Error('Invalid action creator or action type: ' + action);
    }
    this.listeners.push({
      type: action.toString(),
      callback: callback,
      self: this
    });
    return this;
  },

  /**
   * Removes an action listener.
   * @arg {Store~callback} callback
   */
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

  /**
   * Declares a getter function. 
   * @arg {string} funcName
   * @arg {Store~callback} func
   */
  declare: function (funcName, func) {
    var self = this;
    this.exports[funcName] = function () {
      return clone(func.apply(self, Array.prototype.slice.call(arguments)));
    };
    return this;
  },
  
  /**
   * Sets store state.
   * @arg {object} values
   */
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
  
  /**
   * Emits an event.
   * @arg {string} event
   * @arg {*} [data]
   */
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

/**
 * @classdec
 * Built-in exported Store functions.
 * @name StoreExports
 * @class
 */