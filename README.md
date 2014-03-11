Initialization
---

```js
var e = new Eventually.EventHandler();
```

Event Binding and Triggering
---
```js

// BIND
var binding = e.bind('user.login', function(user) {
    console.log('A user logged in:', user.name);
});

// TRIGGER
var event = e.trigger('user.login', {"name": "Admin"});

/*
>>> A user logged in: Admin
*/

// UNBINDING
binding.unbind(); // Unbind a specific callback
e.unbind('user.login'); // Unbind all callbacks
```

Publisher - Subscriber Pattern
---
```js

/**
 * SUBSCRIBE
 * subscribe to topic 'user', which is also triggered by more specific topics such as 'user.login'
 */
var binding1 = e.subscribe('user', function(user) {
    console.log('A generic user-event occured ['+this.name+']:', user.name);
});

// PUBLISH
var event = e.publish('user.login', {"name": "Admin"});

/*
>>> A generic user-event occured [user.login]: Admin
*/

// SUBSCRIBE to past events!
var binding2 = e.subscribe('user.login', function(user) {
    console.log("A user was logged in:", user.name);
});
/*
>>> A user was logged in: Admin
*/
```
