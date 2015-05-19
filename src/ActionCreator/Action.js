/**
 * Creates an action creator function.
 *
 * The first argument declares the function name. It should follow either camelCase or snake_case.
 *
 * The callback function is optional. If it is undefined the action creator will be a simple data passing
 * function which wraps the identifier and payload to an object and dispatches it to the Dispatcher.
 *
 * If the function is provided it must take care of dispatching by calling `this.request` or `this.dispatch`.
 *
 * @example
 * var Bike = ActionCreator.create("Bike").action("setGear").exports;
 * Bike.setGear(5); // dispatches {type: "Bike.setGear", value: 5}
 *
 * @example
 * var Bike = ActionCreator.create("Bike")
 *   .action("setGear", function (gear) {
 *     if (gear < 1 || gear >= 7) {
 *       throw new Error("Gear out of bounds");
 *     }
 *     this.dispatch({value: gear});
 *   })
 *   .exports;
 *
 * Bike.setGear(5); // dispatches {type: "Bike.setGear", value: 5}
 *
 * @example
 * // Requests item list from the server and dispatches {type: "Users.getItems", value: {[data from server]}} if successful
 * var Users = ActionCreator.create("Users")
 *   .action("getItems", function (category) {
 *     this.request({
 *       get: "/items",
 *       data: {category: category}
 *     });
 *   })
 *   .exports;
 *
 * Users.getItems("tools");
 *
 * @name action
 * @function
 * @memberof ActionCreator
 * @instance
 * @arg {string}    name        Function name. The name must follow camelCase or snake_case.
 * @arg {Action~actionCallback}  [callback]  Implements the action.
 * @this ActionCreator
 * @returns {ActionCreator}
 */

/*jslint node: true*/
"use strict";

var
  assign          = require('object-assign'),
  serverRequest   = require('../utils/Request'),
  Dispatcher      = require('../Dispatcher');

module.exports = function (name, func) {
  var
    self = this,
    publish = {},
    actionID = this.getID(name);

  if (func) {

    publish[name] = func.bind(func);
    publish[name].error = this.getID(name, 'error');

    /*
     * Action creator inner API
     */

    // DISPATCH
    func.dispatch = function (value) {
      if (typeof value === 'object') {
        if (value.type) {
          throw new Error('Do not assign property `type` to dispatchable object.');
        }
        Dispatcher.dispatch(assign({type: actionID}, value));
      } else {
        Dispatcher.dispatch({type: actionID, value: value});
      }
    };

    // REQUEST
    func.request = function (def) {
      def.actionID = actionID;
      def.id = self.createRequestID(name);
      if (!def.dispatch) {
        def.dispatch = actionID;
      }
      return serverRequest(def);
    };

  } else {
    publish[name] = function (value) {
      Dispatcher.dispatch({type: actionID, value: value});
    };
  }
  
  // Assign id
  publish[name].toString = function () {
    return actionID;
  };

  return publish;
};
