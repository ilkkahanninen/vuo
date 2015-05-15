# Vuo

## Usage

### ActionCreator

```javascript
// AuthActions.js

var ActionCreator = require("vuo").ActionCreator,
    AuthActions   = new ActionCreator("Auth", module.exports);

AuthActions

  .action("login", function (form) {
      this.request({
          post: '/login',
          data: form
      });
  })
  
  .action("logout");
```

### Store

```javascript
// AuthStore.js

var Store = require("vuo").Store,
    AuthActions = require('./AuthActions');
    
module.exports = Store.create({
    state: function ($) {
        $.define("token").is("null, string");
        $.define("user").is("null, string");
    },

    listeners: function ($) {
        $.on(AuthActions.LOGIN, function (payload) {
            $.setState({
                token: payload.token,
                user: payload.user
            });
        });
        $.on(AuthActions.LOGOUT, function () {
            $.setState({token: null, user: null});
        });
    },
    
    getters: function (get, $) {
        get.loggedIn = function () {
            return $.state.token ? true : false;
        }
    }
});
```

### React component

```javascript
// AuthExample.jsx

var React = require("React"),
    Vuo = require("vuo-react"),
    Form = require("vuo-react/components/form"),
    AuthStore = require('./AuthStore'),
    AuthActions = require('./AuthActions');

module.exports = React.createClass({
    mixins: [Vuo.mixin],
    
    bindStores: function () {
        Vuo.bindStates(AuthStore, ["username", "loggedIn"]);
    },
    
    render: function () {
        if (this.state.loggedIn) {
          return <div>Logged in as {this.state.username}</div>;
        }
        return (this
          <Form action={AuthActions.login}>
            <label>Username</label><input name="username" type="text"/>
            <label>Password</label><input name="password" type="password"/>
            <input type="submit" value="Log in"/>
          </Form>
        );
    }
});
```
