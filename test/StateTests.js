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
    var state = State.create('name', 'MyNamespace', 'string');
    
    state.set('Wilco');
    assert(state.get(), 'Wilco');
  });

  it('validates invalid string correctly', function () {
    var state = State.create('name', 'MyNamespace', 'string');
    assert.throws(function () { state.set(303); });
  });

  it('stores an object to local storage correctly', function () {
    var state = State.create('obj', 'MyNamespace', 'object', {}, State.storeLocally());
    
    state.set({name: 'Wilco'});
    
    // Create state again
    state = State.create('obj', 'MyNamespace', 'object', {}, State.storeLocally());

    assert(state.get().name, 'Wilco');

  });

});