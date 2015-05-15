/*jslint node: true*/
/*global window*/
"use strict";

var supportsLocalStorage = (typeof window !== 'undefined' && window.localStorage) ? true : false;

function LocalStorage(namespace, name) {
  this.id = namespace + ':' + name;
  if (!supportsLocalStorage) {
    console.log('Warning: Local storage not supported');
  }
}

LocalStorage.prototype.set = function (value) {
  if (supportsLocalStorage) {
    window.localStorage[this.id] = JSON.stringify(value);
  }
  return value;
};

LocalStorage.prototype.get = function (defaultValue) {
  if (supportsLocalStorage) {
    try {
      return JSON.parse(window.localStorage[this.id]);
    } catch (e) {
    }
  }
  return defaultValue;
};

module.exports = LocalStorage;
