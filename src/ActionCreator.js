/*jslint node: true*/
"use strict";

var
  Dispatcher = require('./Dispatcher'),
  assign = require('object-assign'),
  serverRequest = require('./Request');

exports.create = function (groupName) {
  var
    requestCounter = 0,
    userAPI = {},
    ctorAPI = {

      action: function (name, func) {
        var
          actionID = groupName + '.' + name,
          constName = name.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(); // camelCase to CAMEL_CASE

        userAPI[constName] = actionID;
        
        if (func) {
          
          userAPI[constName + '_ERROR'] = actionID + '.error'; // Used when request fails
          
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
          userAPI[name] = func.bind(func);
          
          // REQUEST
          func.request = function (def) {
            requestCounter += 1;
            def.actionID = actionID;
            def.id = '#' + requestCounter + ' ' + actionID;
            if (!def.dispatch) {
              def.dispatch = actionID;
            }
            return serverRequest(def);
          };
          
        } else {
          userAPI[name] = function (value) {
            Dispatcher.dispatch({type: actionID, value: value});
          };
        }
        
        return ctorAPI;
      },
      
      // RESTFUL RESOURCE
      resource: function (resourceName, url, options) {
        
        function createRequestFunc(name, url, method, sendID) {
          var
            actionID = groupName + '.' + resourceName + '.' + name,
            constName = (resourceName + '_' + name).replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(); // camelCase to CAMEL_CASE
          
          userAPI[constName] = actionID;
          userAPI[constName + '_ERROR'] = actionID + '.error';
          
          return function (id, value, def) {
            requestCounter += 1;
            var
              reqURL = url.replace(/\/:(\w)+/, sendID ? '/' + id : ''),
              request = assign({}, def, options || {}, {
                actionID: actionID,
                id: '#' + requestCounter + actionID,
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
        
        userAPI[resourceName] = {
          get:    createRequestFunc('get', url, 'get', true),
          query:  createRequestFunc('query', url, 'get', false),
          set:    createRequestFunc('set', url, 'post', true),
          remove: createRequestFunc('remove', url, 'delete', true)
        };
        
        return ctorAPI;
      },

      publicAPI: function () {
        return userAPI;
      }
    };
  return ctorAPI;
};
