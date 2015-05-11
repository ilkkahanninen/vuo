/*jslint node: true*/
/*global describe, it, afterEach*/
"use strict";

var
  Vuo = require('..'),
  ActionCreator = Vuo.ActionCreator,
  Dispatcher = Vuo.Dispatcher,
  request = require('../src/Request'),
  assert = require('assert');

describe('Actions', function () {
  var listenerID;
  
  afterEach(function () {
    try { Dispatcher.unregister(listenerID); } catch(e) {}
  });
  
  it('just works', function (done) {
    
    // Create simple action creator
    var NameAction = ActionCreator.create('Test')
      .action('setName')
      .publicAPI();

    // Test things
    assert(NameAction.SET_NAME, 'Test.setName');
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === NameAction.SET_NAME) {
        assert(payload.value, 'Mickey');
        done();
      }
    });
    
    NameAction.setName('Mickey');
    
  });

  it('just works with custom action which sends a string', function (done) {
    // Create simple action creator
    var NameAction = ActionCreator.create('Test2')
      .action('setName', function (value) {
        this.dispatch(value.toUpperCase());
      })
      .publicAPI();

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
    
    // Create simple action creator
    var NameAction = ActionCreator.create('Test3')
      .action('setName', function (value) {
        this.dispatch({
          value: value,
          lowercase: value.toLowerCase()
        });
      })
      .publicAPI();

    // Test things
    assert(NameAction.SET_NAME, 'Test3.setName');
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === NameAction.SET_NAME) {
        assert(payload.value, 'Mickey');
        assert(payload.lowercase, 'mickey');
        done();
      }
    });
    
    NameAction.setName('Mickey');
    
  });
  
  it('can request data from server', function (done) {
    
    var ServerAction = ActionCreator.create('Server')
      .action('getText', function () {
        this.request({
          get: 'http://jsonplaceholder.typicode.com/users/:id',
          args: {id: 1}
        });
      })
      .publicAPI();
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === ServerAction.GET_TEXT) {
        assert(payload.id, 1);
        done();
      }
      if (payload.type === Vuo.Actions.REQUEST_ERROR) {
        throw new Error("Request failed: " + payload.error.message);
      }
    });
    
    ServerAction.getText();
    
  });

  it('sends error message on request fail', function (done) {
    
    var ServerAction = ActionCreator.create('Server')
      .action('getText', function () {
        this.request({get: 'sudhfdisbgsdufghdfughdpfguhdfpgudhf'});
      })
      .publicAPI();
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === ServerAction.GET_TEXT_ERROR) {
        done();
      }
    });
    
    ServerAction.getText();    
  });
  
  describe("Restful resource", function () {
    it('creates a restful resource', function (done) {

      var RestAction = ActionCreator.create('Rest')
        .resource('users', 'http://jsonplaceholder.typicode.com/users/:id')
        .publicAPI();

      // Functions exist
      assert(typeof RestAction.users.get, 'function');
      assert(typeof RestAction.users.query, 'function');
      assert(typeof RestAction.users.set, 'function');
      assert(typeof RestAction.users.remove, 'function');
      
      // Test get
      listenerID = Dispatcher.register(function (payload) {
        if (payload.type === RestAction.USERS_GET) {
          done();
        }
        if (payload.type === Vuo.Actions.REQUEST_ERROR) {
          throw new Error("Request failed: " + payload.error.message);
        }
      });

      RestAction.users.get(1);
    });
  });
  
});
