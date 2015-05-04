/*jslint node: true*/

"use strict";

var
  xtype = require('xtypejs'),
  clone = require('clone');

exports.create = function (obj, name) {
  
  var validation = [], isPublic = true;
  obj[name] = null;
  
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
        obj[name] = value;
        return self;
      };
      
      // TODO: state().storedLocally()      
      
      return self;
    },
    
    set: function (value) {
      var diff = false;
      validation.forEach(function (validate) {
        value = validate(value);
      });
      diff = (obj[name] !== value);
      obj[name] = value;
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