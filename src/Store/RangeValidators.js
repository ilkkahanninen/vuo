/*jslint node: true*/
"use strict";

exports.min = function (minValue, strict) {
  this.set = function (value) {
    if (strict && (typeof value !== 'number' || value < minValue)) {
      throw new Error("Invalid value: " + value + " < " + minValue);
    }
    return Math.max(minValue, value);
  };
};

exports.max = function (maxValue, strict) {
  this.set = function (value) {
    if (strict && (typeof value !== 'number' || value > maxValue)) {
      throw new Error("Invalid value: " + value + " > " + maxValue);
    }
    return Math.min(maxValue, value);
  };
};

exports.bound = function (minValue, maxValue, strict) {
  this.set = function (value) {
    if (strict && (typeof value !== 'number' || value > maxValue || value < minValue)) {
      throw new Error("Invalid value: " + value + " (expected to be in range " + minValue + " - " + maxValue + ")");
    }
    return Math.min(maxValue, Math.max(minValue, value));
  };
};
