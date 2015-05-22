# Stores

Stores are like models but without setters. A store listens to actions, updates its
state according to them and emits change events when the state changes. Vuo stores
validate values to state and emit change events automatically.

## Create a store

Create the store by instantiating Store. Store works the same way as ActionCreator:
the function calls are chainable and exported functions are added to `exports`
property and you can pass an object for automatic exporting.

```javascript
var Store = require("vuo").Store;
var MyStore = new Store("MyStore", module.exports);
```

## Declare store state

Declare state properties by calling `addState(name, type, initialValue, initializers)`.
Type follows xtype notatition. An error is thrown if somebody tries to set a value
which doesn't satisfy the type string. Fourth argument is optional. It is a single
initializer instance or and array of them. Initializers add new functionality to the
state like automatic local storage and custom validation.

```javascript
MyStore
  .addState("name",   "null, string",   null);
  .addState("age",    "number",         0);
```

### State validators and initalizers

If you need more validation for the state than what type checking ensures you
need validators. These are added by passing their initializers as a fourth argument
for `addState()`.

### Validating numbers

These are silent. The number is silently adjusted to follow the rule:

```javascript
MyStore
  .addState("playerCount", "number", 1, State.min(1))
  .addState("turnLength", "number", 60, State.max(180))
  .addState("initialPlayerCoins", "number", 50, State.bound(1, 100))
```

Number validator functions take boolean as a second argument which
turns strict mode on. If the number is out of bound an Error is thrown.

```
MyStore.addState("turn", "number", 1, State.min(1, true));
```

### Keeping a state in local storage

Sometimes it is useful to store the state to browser's local storage
for better performance or to keep authentication token in memory between
browser refreshes.

Add local storaging with `State.storeLocally()` initializer.

```javascript
MyStore.addState("token", "null, string", null, State.storeLocally());
```

### Keeping state hidden

If it is preferable to keep a state property hidden (not available through
automatically generated getter functions) use `protected()` initializer.
You may still publish this state via a custom getter.

```javascript
MyStore.addState("secret", "string", "Don't tell mama", State.protected());
```

## Action listeners

Register your store to listen actions with `on()` function.
It takes the action identifier as first argument and a callback function as a
second argument. Identifier can be either a string or a function created
with ActionCreator.

Call `this.setState()` inside the callback to update the state. It takes an
object as an argument and assigns it to the current state. Store emits an change
event if the store state changes.

```javascript
MyStore
  .on(MyActions.setProperties, function (payload) {
      this.setState({
          color:  payload.color,
          size:   payload.size
      });
  })
```

### Shortcut to update a single property

You can pass a string instead of a function to `on()`. The string must be a valid state property name.
**Notice:** The new state value is taken from the payload's value property.

```javascript
MyStore.on(MyActions.setName, "name")
```

### Listening request errors

ActionCreator dispatches an error action when the server request fails.
You must pass the error identifier to listen to these actions.

```javascript
MyStore.on(MyActions.getUsers.error, function (payload) {
  console.log('Something went wrong', payload.error);
});

## Public API

Store keeps its public API in `exports` property.

It has always `getState()`, `on()` and `removeListener()` functions by default.
Every state property gets its own getter function (except if it is a protected state).

```javascript
var api = {};
var MyStore = Store.create("Store", api)
  .addState("name", "string", "Dolan")
  .addState("age", "number", 20);
  
api.name();     // -> "Dolan"
api.age();      // -> 20
api.getState(); // -> {name: "Dolan", age: 20}
```

### Custom getters

**Notice:** Never update the state inside these functions. Getters must never have side effects.
Instead create an action and bind your store to listen to it.

```
MyStore.declare('fullName', function () {
  return this.state.firstName + ' '  + this.state.surname;
});
```
