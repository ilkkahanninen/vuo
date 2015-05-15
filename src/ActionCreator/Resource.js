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
      errorID     = self.getID(resourceName, name, 'error'),
      actionConst = self.getConst(resourceName, name),
      errorConst  = self.getConst(resourceName, name, 'error');

    publish[actionConst] = actionID;
    publish[errorConst] = errorID;
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
