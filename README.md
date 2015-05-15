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

Notice: vuo-react is a separate project.

```javascript
// AuthExample.jsx

var React = require("react"),
    Vuo = require("vuo-react"),
    AuthStore = require('./AuthStore'),
    AuthActions = require('./AuthActions');

module.exports = React.createClass({
    mixins: [Vuo.mixins.BindStores],
    
    bindStores: function () {
        Vuo.bindStore(AuthStore, ["username", "loggedIn"]);
    },
    
    render: function () {
        if (this.state.loggedIn) {
          return <div>Logged in as {this.state.username}</div>;
        }
        return (
          <Vuo.Form action={AuthActions.login}>
            <label>Username</label><input name="username" type="text"/>
            <label>Password</label><input name="password" type="password"/>
            <input type="submit" value="Log in"/>
          </Vuo.Form>
        );
    }
});
```
