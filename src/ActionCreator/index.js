/*jslint node: true*/
"use strict";

var
  Dispatcher = require('../Dispatcher'),
  assign = require('object-assign'),
  serverRequest = require('../utils/Request'),
    
  requestCounter = 0;

/**
 * @classdesc
 * ActionCreator creates action creator groups which contain the main functions.
 *
 * Each action creator dispatches actions with automatically assigned identifiers.
 * Identifiers are constructed from the action group name and action creator name
 * and added as a property to the action group object.
 *
 * For example `ActionCreator("Users").action("sendMessage")` creates an object
 * with a function `sendMessage(value)` and a corresponding id property `SEND_MESSAGE`.
 * Use the constant when you register your store to listen the action.
 *
 * Identifer property names follow CONST_CASE. Function names must follow either
 * camelCase, CamelCase or snake_case. The names are consrtucted as follows:
 *
 * ```
 * helloCamelOwners    -> HELLO_CAMEL_OWNERS
 * CapitalizedCamel123 -> CAPITALIZED_CAMEL123
 * hello_world         -> HELLO_WORLD
 * helloUSA            -> HELLO_USA
 * ```
 *
 * ActionCreator provides also a REST/AJAX API for server communication.
 * When used an extra identifier is published for error messages. It follows
 * the main identifier, but the name ends with _ERROR, e.g. GET_USERS -> GET_USERS_ERROR.
 *
 * @arg {string}    groupName   Group name. CamelCase format is recommended.
 * @arg {object}    [exports]   An object where the functions and identifiers are stored into, e.g. `module.exports`
 * @constructor
 */
function ActionCreator(groupName, funcObj) {
  /**
   * Action group name.
   */
  this.group = groupName;
  /**
   * An object containing action creators and identifiers.
   * @example
   * ActionCreator("Foo").action("bar").exports // -> {bar: [function], BAR: "Foo.bar"}
   */
  this.exports = funcObj || {};
}

/**
 * Creates a new action creator group. Equivalent to creating ActionCreator with `new` keyword.
 * @arg {string}    groupName   Group name. CamelCase format is recommended.
 * @arg {object}    [exports]   An object where the functions and identifiers are stored into.
 * @static
 * @returns {ActionCreator}
 */
ActionCreator.create = function (groupName, funcObj) {
  return new ActionCreator(groupName, funcObj);
};

/**
 * Extends ActionCreator functionality. Can be used to add new action creator features by other modules.
 * @arg {string} name   Function name (e.g. "resource")
 * @arg {func}   func   A callback function
 * @static
 */
ActionCreator.extend = function (name, func) {
  ActionCreator.prototype[name] = function () {
    assign(this.exports, func.apply(this, arguments));
    return this;
  };
};

/**
 * Formats an identifier string for the given name.
 * @arg {...string} name Name token
 * @returns {string}
 */
ActionCreator.prototype.getID = function () {
  return this.group + '.' + Array.prototype.slice.call(arguments).join('.');
};

/**
 * Formats a server request identifier for the given name. **Notice:** Two consecutive calls create different strings.
 * @arg {...string} name Name token
 * @returns {string}
 */
ActionCreator.prototype.createRequestID = function () {
  requestCounter += 1;
  return requestCounter + '# ' + this.getID.call(this, Array.prototype.slice.call(arguments));
};

ActionCreator.extend('action',   require('./Action'));
ActionCreator.extend('resource', require('./Resource'));

/*
** EXPORT
*/
module.exports = ActionCreator;
