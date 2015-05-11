/*jslint node: true*/
/*global window*/

"use strict";

var
  xtype = require('xtypejs'),
  clone = require('clone'),
  supportsLocalStorage = (typeof window !== 'undefined' && window.localStorage) ? true : false;

exports.create = function (obj, name, namespace) {
  
  var
    validation = [],
    isPublic = true,
    storageID = (namespace || 'Global') + ':' + name,
    stored;
  obj[name] = undefined;
  
  
  return {
    def: function () {
      var self = this;
      
      // .is(def) - Adds xtype validation for value
      self.is = function (type) {
        validation.push(function (value) {
          if (!xtype.is(value, type)) {
            throw new Error('Type of value invalid. Expected ' + type + ', got ' + xtype.type(value) + ': ' + value);
          }
          return value;
        });
        return self;
      };
      
      // state().protect()
      self.protect = function () {
        isPublic = false;
        return self;
      };
      
      // state().init()
      self.init = function (value) {
        if (obj[name] === undefined) {
          obj[name] = value;
        }
        if (stored === 'local' && supportsLocalStorage) {
          window.localStorage[storageID] = value;
        }
        return self;
      };
      
      // state().storeLocally()
      self.storeLocally = function () {
        stored = 'local';
        if (supportsLocalStorage) {
          obj[name] = window.localStorage[storageID];
        }
        return self;
      };
      
      return self;
    },
    
    set: function (value) {
      var diff = false;
      validation.forEach(function (validate) {
        value = validate(value);
      });
      diff = (obj[name] !== value);
      obj[name] = value;
      
      if (stored === 'local') {
        if (supportsLocalStorage) {
          window.localStorage[storageID] = value;
        }
      }
      
      return diff;
    },
    
    get: function () {
      var value;
      if (!isPublic) {
        throw new Error('Cannot access protected state `' + name + '`');
      }
      value = obj[name];
      if (typeof value === 'object') {
        return clone(value);
      }
      return value;
    }
  };
};