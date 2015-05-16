/*jslint node: true*/
/*global window*/

"use strict";

var
  TypeValidator   = require('./TypeValidator'),
  RangeValidators = require('./RangeValidators'),
  LocalStorage    = require('./LocalStorage'),
  clone           = require('clone');

/*
** CONSTRUCTOR
*/

function State(name, namespace, type, initialValue, initializers) {
  var self = this;
  
  this.namespace = namespace || 'Global';
  this.name = name;
  this.isPublic = true;
  this.setHandlers = [];
  
  if (typeof type === 'string') {
    this.setHandlers.push(new TypeValidator(type));
  }
  
  if (initializers) {
    if (!(initializers instanceof Array)) {
      initializers = [initializers];
    }
    initializers.forEach(function (init) {
      init.call(self);
    });
  }
  
  if (this.value === undefined) {
    this.set(initialValue);
  }
}

/*
** ACCESSORS
*/
State.prototype.set = function (value) {
  var oldValue = this.value;

  // Validate new value & do stuff
  this.setHandlers.forEach(function (handler) {
    value = handler.set(value);
  });

  // Store state
  this.value = value;
  return value !== oldValue;
};

State.prototype.get = function () {
  if (!this.isPublic) {
    throw new Error("Tried to access a protected state " + this.namespace + ":" + this.name);
  }
  return clone(this.value);
};

/*
** EASE OF ACCESS HELPER
*/

State.create = function (name, namespace, type, initialValue, initializers) {
  return new State(name, namespace, type, initialValue, initializers);
};

/*
** INITIALIZERS
**
** Initializers are always second order functions so the user doesn't have to
** remember when to use parenthesis and when not.
*/

State.protect = function () {
  return function () {
    this.isPublic = false;
  };
};

State.storeLocally = function () {
  return function () {
    var storage = new LocalStorage(this.namespace, this.name);
    this.setHandlers.push(storage);
    this.value = storage.get(this.value);
  };
};

State.min = function (minValue, strict) {
  return function () {
    this.setHandlers.push(new RangeValidators.min(minValue, strict));
  };
};

State.max = function (maxValue, strict) {
  return function () {
    this.setHandlers.push(new RangeValidators.max(maxValue, strict));
  };
};

State.bound = function (minValue, maxValue, strict) {
  return function () {
    this.setHandlers.push(new RangeValidators.bound(minValue, maxValue, strict));
  };
};

/*
** EXPORTS
*/

module.exports = State;
