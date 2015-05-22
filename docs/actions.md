# Creating actions

Create a group of actions by creating a new ActionCreator instance.
The first argument gives a name for your group.

```javascript
var ActionCreator = require("vuo").ActionCreator;
var MyActions = new ActionCreator("MyActions");
```

## Simple data dispatching

The most common action creator is a function which takes an
argument and dispatches it immediately.

```javascript
MyActions.action("setName");
```

The code above creates a function `setName(arg)` which dispatches a payload like this:

```javascript
{
  type: "MyActions.setName",
  value: "John Doe"
}
```

## Custom actions

If you want to do something more complex like validate arguments,
make a server request et cetera, pass a callback function as a second argument.
You have to dispatch the data by yourself in the callback.

If you feed dispatch function with an object it will add type property to it and pass
it to the dispatcher. If the given data is a non-object (string, number, boolean,
undefined or null) it will be wrapped to an object with a property name value.

### Example 1

```javascript
MyActions.action("setAge", function (age) {
  if (typeof age !== 'number' || age < 0) {
    throw new Error("Invalid age");
  }
  this.dispatch(32);
});
```

Payload:

```javascript
{
  type: "MyActions.setAge",
  value: 32
}
```

### Example 2

```javascript
MyActions.action("setProperties", function (color, size, weight) {
  this.dispatch({
    color: color,
    size: size,
    weight: weight
  });
});
```

Payload:

```javascript
{
  type: "MyActions.setProperties",
  color: "red",
  size: "huge",
  weight: 1000
}
```


## Server requests

ActionCreator comes with AJAX functionality (provided by SuperAgent library).
It takes care of dispatching the server response automatically. See (request)[request.html]
for more information.

```javascript
MyActions.action("getUsers", function (query) {
      this.request({
          get: "/users",
          data: query
      });
  })
```

The code above dispatches makes first a GET request to `/users`. If the request is
succesful a payload like this is dispatched:

```javascript
{
  type: "MyActions.getUsers",
  value: RESPONSE FROM SERVER
}
```

But if the request fails:

```javascript
{
  type: "MyActions.getUsers.error",
  error: ERROR OBJECT
}
```

## RESTful resources

Okay, you got a nice REST API on your server and now you have to use it.
Thankfully it couldn't be easier:

```javascript
MyActions.resource("users", "/users/:id");
```

This creates an object with following functions:

* query()
* get(id)
* set(id, value)
* remove(id)
```

## Exporting the API

ActionCreator stores all functions to a property `exports`. Use it to export your API:

```javascript
module.exports = MyActions.exports;
```

If you pass `module.exports` as a second argument to the constructor functions are
automatically exported to it:

```javascript
new ActionCreator("MyOtherActions", module.exports);
```

## Chaining

Functions which declare actions return the ActionCreator instance so you can chain the
calls to a beautiful block of code. There is also `create` function for your convience.
`ActionCreator.create(group, exports)` is equivalent to `(new ActionCreator(group, exports))`.

```javascript
ActionCreator.create("Rect", module.exports)
  .action("setName")
  .action("setColor")
  .action("setSize", function (w, h) {
    this.dispatch({w: w, h: h});
  });
```
