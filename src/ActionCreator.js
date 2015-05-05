/*jslint node: true*/
"use strict";

var
  Dispatcher = require('./Dispatcher'),
  assign = require('object-assign');

exports.create = function (groupName) {
  var
    userAPI = {},
    ctorAPI = {

      action: function (name, func) {
        var
          actionID = groupName + '.' + name,
          constName = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(); // camelCase to CAMEL_CASE

        userAPI[constName] = actionID;
        if (func) {
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
          userAPI[name] = func.bind(func);
        } else {
          userAPI[name] = function (value) {
            Dispatcher.dispatch({type: actionID, value: value});
          };
        }
        
        return ctorAPI;
      },

      publicAPI: function () {
        return userAPI;
      }
    };
  return ctorAPI;
};