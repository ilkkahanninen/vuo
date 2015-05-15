/*jslint node: true*/
"use strict";

var xtype = require('xtypejs');

function TypeValidator(type) {
  this.type = type;
}

TypeValidator.prototype.set = function (value) {
  if (!xtype.is(value, this.type)) {
    throw new Error('Invalid value type. Expected ' + this.type + ', got ' + xtype.type(value) + ': ' + value);
  }
  return value;
};

module.exports = TypeValidator;
