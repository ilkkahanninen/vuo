# ActionCreator

```var ActionCreator = require("vuo").ActionCreator;```

ActionCreator creates action functions.

***ActionCreator.create(groupName)*** creates a new action group. Every action function belongs to one group. **create()**  returns a creator object which can be used to create the action functions by calling ***action(name, func)***. Action functions are exported from the group by calling ***publicAPI()***.

Every action function has the given name and a corresponding constant which is used as an action identifier. Function name must follow camel case e.g. **myOwnAction**. The corrensponding constant follows const case **MY_OWN_ACTION**. The action identifier is a combination of group name and action name e.g. **MyActions.myOwnAction**.

```javascript
// Create MyActions group
var MyActions = ActionCreator.create("MyActions")

  // A pass-thru action creator
  .action("setName")
  
  // Action creator with manual dispatching
  .action("setSize", function (width, height) {
    this.dispatch({
      width: width,
      height: height
    });
  })
  
  // Action creator with a request to the server
  .action("getItems", function (query) {
    this.request({
      post: '/updateTags',
      data: {
        dataQuery: query
      }
    });
  })
  
  // Export action functions
  .publicAPI();
```

## Pass-thru actions

A pass-thru action is the simplest function which passes the given argument (optional) as a value inside the payload.

```javascript
var MyActions = ActionCreator.create("MyActions")
  .action("setName")
  .publicAPI();
```

Calling **MyAction.setName("dolan")** dispatches the following payload:

```javascript
{
    "type": "MyActions.setName",
    "value": "Dolan"
}
```

## Manual dispatching

If you need more than one argument or you want to modify/validate the arguments before dispatching you can do it by creating the function and calling ***this.dispatch(payload)***.

```javascript
var MyActions = ActionCreator.create("MyActions")
  .action("setSize", function (width, height) {
    this.dispatch({
      width: width,
      height: height
    });
  })
  .publicAPI();
```

Calling **MyAction.setSize(1024, 768)** dispatches the following payload:

```javascript
{
  "type": "MyActions.setSize",
  "width": 1024,
  "height": 768
}
```

## Server requests

Action creators are a good place for server request in Flux architecture and Vuo supports it by providing ***this.request*** for easy communication with the server.

```javascript
var MyActions = ActionCreator.create("MyActions")
  .action("getItems", function (query) {
    this.request({
      post: '/updateTags',
      data: {
        dataQuery: query
      }
    });
  })
  .publicAPI();
```

Calling **MyAction.getItems("cutlery")** sends a POST request to **/updateTags** with data **{dataQuery: "cutlery"}**. After the response the dispatched payload could be something like this:

```javascript
{
  "type": "MyActions.getItems",
  "items": ["spoon", "fork", "knife", "spork"]
}
```
