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
  Dispatcher = Vuo.Dispatcher,
  assert = require('assert');

describe("Store", function () {
  
  it('Exists', function () {
    assert(Store);
  });
  
  describe("Init object validation", function () {
    it('Accepts a valid object', function () {
      Store.create({
        listeners: function () {},
        state: function () {},
        getters: function () {}
      });
    });
    
    it('Fails on invalid arguments', function () {
      [null, 'Hello', 123, function () {}].forEach(function (args) {
        assert.throws(function () {
          Store.create(args);
        });
      });
    });
  });
  
  describe("Getters", function () {
    
    it('throws on exception if one tries to get a protected state', function () {
      
      // Create a simple store for name
      var store = Store.create({
        state: function ($) {
          $.define('secret').protect();
        }
      });
      
      // Check state
      assert.throws(function () { store.secret(); });
    });

    it('returns a value from a custom getter', function () {
      
      // Create a simple store for name
      var store = Store.create({
        state: function ($) {
          $.define('a').is('number').init(2);
          $.define('b').is('number').init(3);
        },
        
        getters: function (get, $) {
          get.sum = function () {
            return $.state.a + $.state.b;
          };
        }
      });
      
      // Check state
      assert(store.a(), 2);
      assert(store.b(), 3);
      assert(store.sum(), 5);
    });

    it('does\'t return the original version of object', function () {
      var store, obj1, obj2, ary1, ary2;
      
      // Create a simple store for name
      store = Store.create({
        listeners: function () {},
        
        state: function ($) {
          $.define('object').init({value: 0});
          $.define('array').init([0]);
        }
      });
      
      // Check state
      obj1 = store.object();
      obj2 = store.object();
      obj1.value = 1;
      assert.notEqual(obj1.value, obj2.value);
      
      ary1 = store.array();
      ary2 = store.array();
      ary1[0] = 1;
      assert.notEqual(ary1[0], ary2[0]);
      
    });
    
    it('returns the whole state', function () {
      var store = Store.create({
        listeners: function () {},
        state: function ($) {
          $.define('a').init(2);
          $.define('b').init(3);
        }
      });
      
      assert(store.a(), 2);
      assert(store.b(), 3);
      assert(store.getState(), {a: 2, b: 3});
    });

    it('saves to local storage', function () {
      var store1 = Store.create({
        name: 'TestStore',
        state: function ($) {
          $.define('a').storeLocally().init(2);
        }
      });

      var store2 = Store.create({
        name: 'TestStore',
        state: function ($) {
          $.define('a').storeLocally().init(9999);
        }
      });
      
      assert(store1.a(), store2.a());
    });
    
  });
  
  describe("Listeners & emitters", function () {
    
    it('should not emit a change event if the state does not really change', function (done) {
      var store, listenerCount;
      
      // Create a simple store for name
      store = Store.create({
        
        listeners: function ($) {
          $.on('setName', function (payload) {
            $.setState({name: payload.value});
          });
        },
        
        state: function ($) {
          $.define('name').is('undefined, string').init('Dolan');
        }

      });

      // Listen to changes
      function onChange() {
        store.offChange(onChange);
        throw new Error('Should not emit the event');
      }
      store.onChange(onChange);
      
      // Dispatch message
      Dispatcher.dispatch({type: 'setName', value: 'Dolan'});
      
      //
      setTimeout(function () {
        store.removeChangeListener(onChange);
        done();
      }, 10);
    });
    
    it('changes a state after an action', function (done) {
      var store, listenerCount;
      
      // Create a simple store for name
      store = Store.create({
        
        listeners: function ($) {
          $.on('setName', function (payload) {
            $.setState({name: payload.value});
            assert.equal($.emitter.emit('customEvent'), true);
          });
        },
        
        state: function ($) {
          $.define('name').is('undefined, string');
        }

      });

      // Listen to changes
      listenerCount = 2;

      function checkExit() {
        listenerCount -= 1;
        if (listenerCount === 0) {
          done();
        }
      }
      
      function onChange(changed) {
        store.removeChangeListener(onChange);
        assert(changed.name, 'Goofy');
        checkExit();
      }
      
      function onCustomEvent() {
        store.removeListener('customEvent', onChange);
        checkExit();
      }

      store.on('customEvent', onCustomEvent);
      store.onChange(onChange);
      
      // Dispatch message
      Dispatcher.dispatch({type: 'setName', value: 'Goofy'});
      
      // Check state
      assert(store.name(), "Goofy");
    });
    
  });
  
});