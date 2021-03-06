/**
 * Maps a RESTful API to actions.
 *
 * The first argument declares the function name. It should follow either camelCase or snake_case.
 *
 * @example
 * var MyRestfulAPI = ActionCreator.create("MyRestfulAPI").resource("users", "/users/:id").exports;
 * 
 * // Following functions create a request to the server and dispatch the response if successful
 *
 * MyRestfulAPI.users.query();                 // Type: MyRestfulAPI.USERS_QUERY
 * MyRestfulAPI.users.get(12);                 // Type: MyRestfulAPI.USERS_GET
 * MyRestfulAPI.users.set(23, {name: "John"}); // Type: MyRestfulAPI.USERS_SET
 * MyRestfulAPI.users.remove(12);              // Type: MyRestfulAPI.USERS_REMOVE
 *
 * // If request fails a payload the payload type is MyRestfulAPI.USERS_QUERY_ERROR etc.
 *
 * @name resource
 * @function
 * @memberof ActionCreator
 * @instance
 * @arg {string}    name  Function name. The name must follow camelCase or snake_case.
 * @arg {string}    url   URL to REST API, eg. "/users/:id"      
 * @this ActionCreator
 * @returns {ActionCreator}
 */

/*jslint node: true*/
"use strict";

var
  assign          = require('object-assign'),
  serverRequest   = require('../utils/Request'),
  Dispatcher      = require('../Dispatcher');

module.exports = function (resourceName, url, options) {
  var
    publish = {},
    iface = {},
    self = this;
  
  function createRequestFunc(name, method, sendID) {
    var
      actionID    = self.getID(resourceName, name),
      errorID     = self.getID(resourceName, name, 'error');

    iface[name] = function (id, value, def) {
      var
        reqURL = url.replace(/\/:(\w)+/, sendID ? '/' + id : ''),
        request = assign({}, def, options || {}, {
          actionID: actionID,
          id: self.createRequestID(resourceName, name),
          dispatch: actionID
        });
      request[method] = reqURL;
      if (value) {
        if (typeof value === 'object') {
          request.data = value;
        } else {
          request.data = {value: value};
        }
      }
      serverRequest(request);
    };
    
    // Assign ids
    iface[name].toString = function () {
      return actionID;
    };
    iface[name].error = errorID;
  }

  //                 Name      HTTP method  Send ID
  createRequestFunc('query',  'get',        false);
  createRequestFunc('get',    'get',        true);
  createRequestFunc('set',    'post',       true);
  createRequestFunc('remove', 'delete',     true);
  
  // Wrap interface to a single property
  publish[resourceName] = iface;
  return publish;
};
