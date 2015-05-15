# Vuo

## Usage

### ActionCreator

```javascript
// AuthActions.js

var ActionCreator = require("vuo").ActionCreator;

ActionCreator.create("Auth", module.exports)

  .action("login", function (form) {
      this.request({
          post: '/login',
          data: form
      });
  })
  
  .action("logout")
  
  .resource("userData", "/api/users/:id");
```

### Store

```javascript
// AuthStore.js

var Store = require("vuo").Store,
    AuthActions = require('./AuthActions'),
    
Store.create("Auth", module.exports)

    // States
    .addState("token",      "null, string",   null,   State.storeLocally())
    .addState("user",       "null, object",   null,   State.storeLocally())
    .addState("userData",   "object",         {})
    
    // Listeners
    .on(AuthActions.LOGIN, function (payload) {
        this.setState({
            token:  payload.token,
            user:   payload.user
        });
    })
    
    .on(AuthActions.LOGOUT, function (payload) {
        this.setState({token: null, user: null});
    })
    
    .on(AuthActions.USER_DATA_QUERY, "userData")
    
    // Custom getters
    .declare('loggedIn', function () {
        return this.state.token ? true : false;
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
