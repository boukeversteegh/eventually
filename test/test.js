var expect = require('chai').expect;
var eventually = require('../eventually.js');

describe('EventHandler', function() {
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

	describe('#bind()', function() {
		it('should fire the callback after trigger', function() {
			var e = new eventually.EventHandler();

			var results = [];

			var event1 = e.trigger('user.login', user1);
			var binding1 = e.bind('user.login', writeResult(results));
			var event2 = e.trigger('user.login', user2);
			var binding2 = e.bind('user.login', writeResult(results));

			it("Events triggered before bindings are not executed", function() {
				expect(results.length).to.equal(1);
				expect(results[0].data).to.equal(user2);
				expect(results[0].this).to.equal(event2);
			});

			it("After unbinding one binding, the other still works", function() {
				binding1.unbind();
				var event3 = e.trigger('user.login', user3);

				assert(results.length).to.equal(2);
				assert(results[1].data).to.equal(user3);
			});
		});
	});
	describe('#subscribe()', function() {
		var e = new eventually.EventHandler();

		var results = [];

		var event1 = e.publish('user.login', user1);
		var binding1 = e.subscribe('user', writeResult(results));
		var event2 = e.publish('user.login', user2);

		expect(e.separator).to.equal('.');

		it("Should execute bound events even if published before subscribing", function() {
			expect(results.length).to.equal(2);
			expect(results[0].data).to.equal(user1);
			expect(results[0].this).to.equal(event1);
			expect(results[1].data).to.equal(user2);
			expect(results[1].this).to.equal(event2);
		});
		
		binding1.unbind();

		it("Should no longer execute after unbinding", function() {
			e.trigger('user.login', user1);
			expect(results.length).to.equal(2);
		});
	});
	describe('#subscribe()', function() {
		var e = new eventually.EventHandler();
		var results = [];
		e.subscribe('user', writeResult(results));

		var event = e.publish('user.login', user1);

		it("Should execute bound events with more specific topics", function() {
			expect(results.length).to.equal(1);
			expect(results[0].this).to.equal(event);
		});

	});
	describe('#separator', function() {
		var e = new eventually.EventHandler();
		
		it("Should be '.' by default", function() {
			expect(e.separator).to.equal('.');
		});
	});
	describe('#separator', function() {
		var e = new eventually.EventHandler();
		var results = [];

		// e.separator = ':';
		e.publish('user.login');
		e.subscribe('user', writeResult(results));

		it("Should respect custom separators", function() {
			expect(results.length).to.equal(1);
		});

	});

});

