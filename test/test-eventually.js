var Eventually = require('../eventually');


var user1 = {
	name: "john"
};
var user2 = {
	name: "admin"
};
var user3 = {
	name: "bob"
};

var writeResult = function(results) {
	return function(data) {
		var result = {
			data: data,
			this: this
		};
		results.push(result);
	};
}
exports.bindtrigger = function (test) {
	var e = new Eventually.Eventually.EventHandler();

	var results = [];


	var event1 = e.trigger('user.login', user1);

	var binding1 = e.bind('user.login', writeResult(results));

	var event2 = e.trigger('user.login', user2);

	var binding2 = e.bind('user.login', writeResult(results));

	test.equal(results.length, 1, "Events triggered before bindings are not executed");
	test.equal(results[0].data, user2);
	test.equal(results[0].this, event2);

	binding1.unbind();
	var event3 = e.trigger('user.login', user3);

	test.equal(results.length, 2, 'After unbinding one binding, the other still works');
	test.equal(results[1].data, user3, "Unbinding a specific binding doesn't unbind others");

	test.done();
};

exports.publishsubscribe = function (test) {
	var e = new Eventually.Eventually.EventHandler();

	var results = [];


	var event1 = e.publish('user.login', user1);
	var binding1 = e.subscribe('user.login', writeResult(results));
	var event2 = e.publish('user.login', user2);

	test.equal(results.length, 2, "Events are executed even if published before subscribing");
	test.equal(results[0].data, user1,  'data');
	test.equal(results[0].this, event1, 'this');
	test.equal(results[1].data, user2,  'data');
	test.equal(results[1].this, event2, 'this');

	binding1.unbind();

	e.trigger('user.login', user1);
	test.equal(results.length, 2, "Unbinding works, and no events are fired after unbinding");
	test.done();
};