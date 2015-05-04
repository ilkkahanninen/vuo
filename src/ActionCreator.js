/*jslint node: true*/
"use strict";

var
  Dispatcher = require('./Dispatcher'),
  assign = require('object-assign');

exports.create = function (groupName) {
  var group = {};
  
  return {
    
    action: function (name, func) {
      var
        actionID = groupName + '.' + name,
        constName = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(); // camelCase to CAMEL_CASE
      
      group[constName] = actionID;
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
        group[name] = func.bind(func);
      } else {
        group[name] = function (value) {
          Dispatcher.dispatch({type: actionID, value: value});
        };
      }
    },
    
    publicAPI: function () {
      return group;
    }
            
  };
};