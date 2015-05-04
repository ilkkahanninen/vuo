/*jslint node: true*/
/*global describe, it*/
"use strict";

var
  Vuo = require('..'),
  ActionCreator = Vuo.ActionCreator,
  Dispatcher = Vuo.Dispatcher,
  assert = require('assert');

describe('Actions', function () {
  
  it('just works', function (done) {
    var actions, NameAction;
    
    // Create simple action creator
    actions = ActionCreator.create('Test');
    actions.action('setName');
    
    NameAction = actions.publicAPI();

    // Test things
    assert(NameAction.SET_NAME, 'Test.setName');
    
    Dispatcher.register(function (payload) {
      if (payload.type === NameAction.SET_NAME) {
        assert(payload.value, 'Mickey');
        done();
      }
    });
    
    NameAction.setName('Mickey');
    
  });

  it('just works with custom action which sends a string', function (done) {
    var actions, NameAction;
    
    // Create simple action creator
    actions = ActionCreator.create('Test2');
    actions.action('setName', function (value) {
      this.dispatch(value.toUpperCase());
    });
    
    NameAction = actions.publicAPI();

    // Test things
    assert(NameAction.SET_NAME, 'Test2.setName');
    
    Dispatcher.register(function (payload) {
      if (payload.type === NameAction.SET_NAME) {
        assert(payload.value, 'MICKEY');
        done();
      }
    });
    
    NameAction.setName('Mickey');
    
  });

  it('just works with custom action which sends an object', function (done) {
    var actions, NameAction;
    
    // Create simple action creator
    actions = ActionCreator.create('Test3');
    actions.action('setName', function (value) {
      this.dispatch({
        value: value,
        lowercase: value.toLowerCase()
      });
    });
    
    NameAction = actions.publicAPI();

    // Test things
    assert(NameAction.SET_NAME, 'Test3.setName');
    
    Dispatcher.register(function (payload) {
      if (payload.type === NameAction.SET_NAME) {
        assert(payload.value, 'Mickey');
        assert(payload.lowercase, 'mickey');
        done();
      }
    });
    
    NameAction.setName('Mickey');
    
  });
  
});