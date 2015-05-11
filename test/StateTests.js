/*jslint node: true*/
/*global describe, it*/

"use strict";

// Mock window.localStorage
global.window = {
  localStorage: {}
};


var
  State = require('../src/State'),
  assert = require('assert');

describe("State", function () {
  
  it('exists', function () {
    assert(State);
  });
  
  it('inits state object', function () {
    var
      states = {},
      state = State.create(states, 'name');
    
    assert(state.set);
    assert(state.def);
  });

  it('validates string correctly', function () {
    var
      states = {},
      state = State.create(states, 'name');
    
    state.def().is('string');
    
    state.set('Wilco');
    assert(states.name, 'Wilco');
  });

  it('validates invalid string correctly', function () {
    var
      states = {},
      state = State.create(states, 'name');
    
    state.def().is('string');
    assert.throws(function () { state.set(303); });
  });

  it('stores an object to local storage correctly', function () {
    var
      states = {},
      state = State.create(states, 'obj', 'MyNamespace');
    
    state.def().is('object').storeLocally();
    state.set({name: 'Wilco'});
    
    // Create state again
    state = State.create(states, 'obj', 'MyNamespace');
    state.def().is('object').storeLocally();

    assert(state.get().name, 'Wilco');

  });

});