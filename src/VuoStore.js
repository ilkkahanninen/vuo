/*jslint node: true*/

var
  Store       = require('./Store'),
  VuoActions  = require('./VuoActions');

module.exports = Store.create({
  
  /*
   * Listeners
   */
  listeners: function ($) {
    // Map payload.value to state.authToken
    $.on(VuoActions.SET_AUTH_TOKEN, 'authToken');
  },
  
  /*
   * Initial state
   */
  state: function ($) {
    $.define('authToken').is('undefined, string');
  }
});