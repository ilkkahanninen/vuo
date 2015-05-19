/*jslint node: true*/
/*global describe, it, afterEach*/
"use strict";

// Mock window.localStorage
global.window = {
  localStorage: {}
};

var
  Vuo = require('..'),
  ActionCreator = Vuo.ActionCreator,
  Dispatcher = Vuo.Dispatcher,
  request = require('../src/utils/Request'),
  assert = require('assert');

describe('ActionCreator', function () {
  it('creates correct IDs', function () {
    var Actions = new ActionCreator('Test');
    assert.equal(Actions.getID('setName'), 'Test.setName');
    assert.equal(Actions.getID('names', 'set'), 'Test.names.set');
    assert.equal(Actions.createRequestID('getNames'), '1# Test.getNames');
  });

  it('creates correct IDs for an action', function () {
    var Actions = new ActionCreator('Test');
    Actions.action("foo");
    Actions.resource("bar", "/whatever/:id");
    assert.equal(Actions.exports.foo, 'Test.foo');
    assert.equal(Actions.exports.bar.get, 'Test.bar.get');
  });
});

describe('Actions', function () {
  var listenerID;
  
  afterEach(function () {
    try { Dispatcher.unregister(listenerID); } catch (e) {}
  });
  
  it('just works', function (done) {
    
    // Create simple action creator
    var NameAction = ActionCreator.create('Test')
      .action('setName')
      .exports;

    // Test things
    assert(NameAction.setName, 'Test.setName');
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === NameAction.setName.toString()) {
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
      .exports;

    // Test things
    assert(NameAction.setName, 'Test2.setName');
    
    Dispatcher.register(function (payload) {
      if (payload.type === NameAction.setName.toString()) {
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
      .exports;

    // Test things
    assert(NameAction.setName, 'Test3.setName');
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === NameAction.setName.toString()) {
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
      .exports;
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === ServerAction.getText.toString()) {
        assert(payload.id, 1);
        done();
      }
      if (payload.type === Vuo.Actions.requestError.toString()) {
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
      .exports;
    
    listenerID = Dispatcher.register(function (payload) {
      if (payload.type === ServerAction.getText.error.toString()) {
        done();
      }
    });
    
    ServerAction.getText();
  });
  
  describe("Restful resource", function () {
    it('creates a restful resource', function (done) {

      var RestAction = ActionCreator.create('Rest')
        .resource('users', 'http://jsonplaceholder.typicode.com/users/:id')
        .exports;

      // Functions exist
      assert(typeof RestAction.users.get, 'function');
      assert(typeof RestAction.users.query, 'function');
      assert(typeof RestAction.users.set, 'function');
      assert(typeof RestAction.users.remove, 'function');
      
      // Test get
      listenerID = Dispatcher.register(function (payload) {
        if (payload.type === RestAction.users.get.toString()) {
          done();
        }
        if (payload.type === Vuo.Actions.requestError.toString()) {
          throw new Error("Request failed: " + payload.error.message);
        }
      });

      RestAction.users.get(1);
    });
  });
  
});
