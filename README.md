# Vuo

## Usage

### ActionCreator

```javascript
var ActionCreator = require("vuo").ActionCreator;

module.exports = ActionCreator.create("Auth")

  .action("login", function (username, password) {
      this.request({
          post: '/login',
          data: {
              username: username,
              password: password
          }
      });
  })
  
  .action("logout")
  
  .publicAPI();
```

### Store

```javascript
var Store = require("vuo").Store,
    AuthActions = require('./AuthActions');
    
module.exports = Store.create({
    state: function (define) {
        define("token").is("null, string");
        define("user").is("null, string");
    },

    listeners: function (on, setState, emitter) {
        on(AuthActions.LOGIN, function (payload) {
            setState({
                token: payload.token,
                user: payload.user
            });
        });
        on(AuthActions.LOGOUT, function () {
            setState({token: null, user: null});
        });
    },
    
    getters: function (get, state) {
        get.loggedIn = function () {
            return state.token ? true : false;
        }
    }
});
```

### React component

```javascript
var React = require("React"),
    StoreListener = require("vuo").StoreListener,
    AuthStore = require('./AuthStore');

module.exports = React.createClass({
    mixins: [StoreListener.mixin],
    
    bindStores: function () {
        StoreListener.bindState(AuthStore, "username");
    },
    
    render: function () {
        return <div>{this.state.username || "Not logged in"}</div>;
    }
});
```
