/*jslint node: true*/
/*global describe, it*/

"use strict";

// Mock window.localStorage
global.window = {
  localStorage: {}
};


var
  State = require('../src/Store/State'),
  assert = require('assert');

describe("State", function () {
  
  it('exists', function () {
    assert(State);
  });
  
  it('inits state object', function () {
    var
      states = {},
      state = State.create('name');
    
    assert(state.set);
    assert(state.get);
  });

  it('validates string correctly', function () {
    var state = State.create('name', 'MyNamespace', 'string', '');
    
    state.set('Wilco');
    assert.equal(state.get(), 'Wilco');
  });

  it('validates invalid string correctly', function () {
    var state = State.create('name', 'MyNamespace', 'string', '');
    assert.throws(function () { state.set(303); });
  });

  it('stores an object to local storage correctly', function () {
    var state = State.create('obj', 'MyNamespace', 'object', {}, State.storeLocally());
    
    state.set({name: 'Wilco'});
    
    // Create state again
    state = State.create('obj', 'MyNamespace', 'object', {name: 'lol'}, State.storeLocally());

    assert.equal(state.get().name, 'Wilco');

  });

});

describe("State validation", function () {
  it("min", function () {
    var state = State.create("age", null, "number", 18, State.min(5));
    state.set(1);
    assert.equal(state.get(), 5);
    state.set(100);
    assert.equal(state.get(), 100);
  });
  
  it("max", function () {
    var state = State.create("age", null, "number", 18, State.max(50));
    state.set(1);
    assert.equal(state.get(), 1);
    state.set(100);
    assert.equal(state.get(), 50);
  });

  it("bound", function () {
    var state = State.create("age", null, "number", 18, State.bound(5, 50));
    state.set(1);
    assert.equal(state.get(), 5);
    state.set(25);
    assert.equal(state.get(), 25);
    state.set(100);
    assert.equal(state.get(), 50);
  });
  
});