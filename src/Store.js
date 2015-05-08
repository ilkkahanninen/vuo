/*jslint node: true*/

"use strict";

var
  State = require('./State'),
  xtype = require('xtypejs'),
  Dispatcher = require('./Dispatcher'),
  EventEmitter = require('events').EventEmitter,
  assign = require('object-assign'),
  clone = require('clone');

/**
 *
 */
function validateInitObject(classDef) {
  if (!xtype.is(classDef, 'object')) {
    throw new Error('Invalid Store initialization argument. Expected object, got ' + xtype.type(classDef));
  }
  if (!xtype.is(classDef.listeners, 'undefined, function')) {
    throw new Error('Could not init Store class. Listeners is invalid. Expected function, got ' + xtype.type(classDef.listeners));
  }
  if (!xtype.is(classDef.state, 'function')) {
    throw new Error('Could not init Store class. `state` is missing or invalid. Expected function, got ' + xtype.type(classDef.states));
  }
  if (!xtype.is(classDef.getters, 'undefined, function')) {
    throw new Error('Could not init Store class. Getters is invalid. Expected function, got' + xtype.type(classDef.getters));
  }
}

/**
 *
 */
exports.create = function (classDef) {
  var
    data = {},
    states = {},
    api = {},
    emitter = new EventEmitter();

  function createState(name) {
    var state = State.create(data, name);
    states[name] = state;
    api[name] = state.get;
    return state.def();
  }
  
  function setState(values) {
    var key, changed = {};
    for (key in values) {
      if (values.hasOwnProperty(key)) {
        if (!states[key]) {
          throw new Error('Undefined state key: ' + key);
        }
        if (states[key].set(values[key])) {
          changed[key] = data[key];
        }
      }
    }
    if (Object.keys(changed).length > 0) {
      emitter.emit('change', clone(changed));
    }
  }
  
  function addActionListener(actionID, callback) {
    if (!actionID) {
      throw new Error('Null action identifier');
    }
    switch (typeof callback) {
    case 'function':
      Dispatcher.register(function (payload) {
        if (payload.type === actionID) {
          callback(payload);
        }
      });
      break;

    case 'string':
      Dispatcher.register(function (payload) {
        if (payload.type === actionID) {
          setState({callback: payload.value});
        }
      });
      break;

    default:
      throw new Error('Invalid second argument. Expected for a callback function or a state name.');
    }
  }
  
  validateInitObject(classDef);
  
  //
  if (classDef.getters) {
    classDef.getters(
      api,
      {
        state: data
      }
    );
  }
  
  api.getState = function () {
    return clone(data);
  };
  
  // Easier functions for change event listening
  api.onChange = function (callback) {
    return emitter.addListener('change', callback);
  };
  api.removeChangeListener = function (callback) {
    return emitter.removeListener('change', callback);
  };
  api.on = function (name, callback) {
    return emitter.addListener(name, callback);
  };
  api.removeListener = function (name, callback) {
    return emitter.removeListener(name, callback);
  };
  
  //
  classDef.state({
    define: createState
  });
  
  if (classDef.listeners) {
    classDef.listeners({
      on: addActionListener,
      setState: setState,
      state: data,
      emitter: emitter
    });
  }
  
  return api;
};