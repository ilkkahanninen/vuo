/*jslint node: true*/
/*global describe, it*/

"use strict";

// Mock window.localStorage
global.window = {
  localStorage: {}
};

var
  Vuo = require('..'),
  Store = Vuo.Store,
  State = Vuo.State,
  Dispatcher = Vuo.Dispatcher,
  assert = require('assert');

describe("Store", function () {
  
  it('Exists', function () {
    assert(Store);
  });
  
  describe("Getters", function () {
    
    it('publishes a working getter function for a state', function () {
      
      // Create a simple store for name
      var store = new Store("Test")
        .addState("myValue", "string", "LOL")
        .exports;
      assert.equal(store.myValue(), "LOL");
    });
    
    it('throws on exception if one tries to get a protected state', function () {
      
      // Create a simple store for name
      var store = new Store("Test")
        .addState("secret", "string", "LOL", State.protect())
        .exports;
      
      // Check state
      assert.throws(function () { store.secret(); });
    });

    it('returns a value from a custom getter', function () {
      
      // Create a simple store for name
      var store = new Store("Test")
        .addState("a", "number", 2)
        .addState("b", "number", 3)
        .declare("sum", function () {
          return this.state.a + this.state.b;
        })
        .exports;
      
      assert.equal(store.a(), 2);
      assert.equal(store.b(), 3);
    });

    it('does\'t return the original version of object', function () {
      var store, obj1, obj2;
      
      // Create a simple store for name
      store = new Store("Test")
        .addState("object", "object", {value: 0})
        .exports;
      
      // Check state
      obj1 = store.object();
      obj2 = store.object();
      obj1.value = 1;
      assert.notEqual(obj1.value, obj2.value);
    });
    
    it('returns the whole state', function () {
      var store = new Store("test")
        .addState("a", "number", 2)
        .addState("b", "number", 3)
        .exports;
      
      assert(store.a(), 2);
      assert(store.b(), 3);
      assert(store.getState(), {a: 2, b: 3});
    });

    it('saves to local storage', function () {
      var store1 = new Store("Test")
        .addState("a", "number", 2, State.storeLocally())
        .exports,

      // Because store2 has same store and state name it should get the value (2) from local storage, saved by store1
        store2 = new Store("Test")
        .addState("a", "number", 999999999, State.storeLocally())
        .exports;
      
      assert(store1.a(), store2.a());
    });
    
  });
  
  describe("Listeners & emitters", function () {
    
    it('should not emit a change event if the state does not really change', function (done) {
      var store;
      
      // Create a simple store for name
      store = new Store("Test")
        .addState('name', 'string', 'Dolan')
        .on('setName', function (payload) {
          this.setState({name: payload.value});
        })
        .exports;

      // Listen to changes
      function onChange(x) {
        throw new Error('Should not emit the event');
      }
      store.on('change', onChange);
      
      // Dispatch message
      Dispatcher.dispatch({type: 'setName', value: 'Dolan'});
      
      //
      setTimeout(function () {
        store.removeListener('change', onChange);
        done();
      }, 10);
    });
    
    it('changes a state after an action', function (done) {
      var store;
      
      // Create a simple store for name
      store = new Store("Test")
        .addState('name', 'string', 'Dolan')
        .on('setName2', function (payload) {
          this.setState({name: payload.value});
        })
        .exports;

      // Listen to changes
      function onChange(newStates) {
        assert.equal(newStates.name, "Gooby");
        done();
      }
      store.on('change', onChange);
      
      // Dispatch message
      Dispatcher.dispatch({type: 'setName2', value: 'Gooby'});
    });
    
  });
  
});