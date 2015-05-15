/*jslint node: true*/
"use strict";

var
  assign          = require('object-assign'),
  serverRequest   = require('../utils/Request'),
  Dispatcher      = require('../Dispatcher');

/*
  groupName
  dispatch()
*/

module.exports = function (name, func) {
  var
    self = this,
    publish = {},
    actionID = this.getID(name),
    constName = this.getConst(name);

  publish[constName] = actionID;

  if (func) {

    publish[this.getConst(name, 'error')] = this.getID(name, 'error');
    publish[name] = func.bind(func);

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

  return publish;
};
