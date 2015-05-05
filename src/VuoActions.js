/*jslint node: true*/

var ActionCreator = require('..').ActionCreator;

module.exports = ActionCreator.create("VuoActions")
  .action("setAuthToken")
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
  })
  .publicAPI();
