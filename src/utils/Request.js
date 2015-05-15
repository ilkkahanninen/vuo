/*jslint node: true*/
"use strict";

var
  SuperAgent  = require('superagent'),
  Dispatcher  = require('../Dispatcher');

function buildURI(path, args) {
  var i;
  if (typeof args === 'object') {
    for (i in args) {
      if (args.hasOwnProperty(i)) {
        path = path.replace(':' + i, args[i]);
      }
    }
  }
  return path;
}

module.exports = function (args) {
  var
    VuoActions  = require('../framework/VuoActions'),
    Config      = require('../Config'),
    request;
  
  if (typeof args !== 'object') {
    throw new Error('Invalid argument. Expected object, got:' + args);
  }
  
  if (!args.id) {
    throw new Error('REST request id missing');
  }
  
  // Map to correct verb
  
  if (args.get) {
    request = SuperAgent.get(buildURI(args.get, args.args));
  } else if (args.post) {
    request = SuperAgent.post(buildURI(args.post, args.args));
  } else if (args.put) {
    request = SuperAgent.put(buildURI(args.put, args.args));
  } else if (args.del) {
    request = SuperAgent.del(buildURI(args.del, args.args));
  } else {
    throw new Error('Verb not found:', args);
  }
  
  // Authorization token

  if (args.authorize) {
    request.set({Authorization: Config.authToken});
  }
  
  // Data
  
  if (args.data) {
    request.send(args.data);
  }
  
  // Send
  
  VuoActions.requestBegin(args.id);
  request.end(function (err, response) {
    var payload;
    VuoActions.requestEnd(args.id);
    if (err) {
      if (typeof args.onError === 'function') {
        args.onError(err);
      }
      VuoActions.requestError(args.id, err);
      Dispatcher.dispatch({type: args.actionID + '.error', error: err});
    } else {
      if (typeof args.onComplete === 'function') {
        args.onComplete(response.body);
      }
      if (args.dispatch) {
        payload = response.body || {};
        payload.type = args.dispatch;
        Dispatcher.dispatch(payload);
      }
    }    
  });
  
  return request;
};

module.exports.SuperAgent = SuperAgent;
