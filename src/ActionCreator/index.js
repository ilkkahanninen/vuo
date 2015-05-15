/*jslint node: true*/
"use strict";

var
  Dispatcher = require('../Dispatcher'),
  assign = require('object-assign'),
  serverRequest = require('../utils/Request'),
    
  requestCounter = 0;

/*
** CONSTRUCTOR
*/
function ActionCreator(groupName, funcObj) {
  this.group = groupName;
  this.functions = funcObj || {};
}

/*
** STATIC API
*/
ActionCreator.create = function (groupName, funcObj) {
  return new ActionCreator(groupName, funcObj);
};

ActionCreator.extend = function (name, func) {
  ActionCreator.prototype[name] = function () {
    assign(this.functions, func.apply(this, arguments));
    return this;
  };
};

/*
** UTILS FOR EXTENSIONS
*/
ActionCreator.prototype.getID = function () {
  return this.group + '.' + Array.prototype.slice.call(arguments).join('.');
};

ActionCreator.prototype.getConst = function () {
  return Array.prototype.slice.call(arguments).join('_').replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
};

ActionCreator.prototype.createRequestID = function () {
  requestCounter += 1;
  return requestCounter + '# ' + this.getID.call(this, Array.prototype.slice.call(arguments));
};

/*
** EXTENSIONS
*/
ActionCreator.extend('action',   require('./Action'));
ActionCreator.extend('resource', require('./Resource'));

/*
** EXPORT
*/
module.exports = ActionCreator;
