/*jslint node: true*/
"use strict";

var
  ActionCreator = require('../..').ActionCreator,
  VuoActions = new ActionCreator("VuoActions", module.exports);

VuoActions

  .action("requestBegin", function (id) {
    this.dispatch({id: id});
  })

  .action("requestEnd", function (id) {
    this.dispatch({id: id});
  })

  .action("requestProgress", function (id, progress) {
    this.dispatch({id: id, value: progress});
  })

  .action("requestError", function (id, error) {
    this.dispatch({id: id, error: error});
  });
