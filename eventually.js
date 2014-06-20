(function(root) {
	"use strict";

	/**
	 * @module
	 */
	function Eventually() {

		/**
		 * @class
		 */
		function EventHandler() {

			/** @private */
			this.bindings = {};

			/** @private */
			this.events = [];

			/** @public */
			this.separator = '.';

			/**
			 * Bind to future event
			 * @param {string} name - Identifies the event, exact matching.
			 * @param {function} fn - Function that will be executed when triggered.
			 * @returns {EventBinding}
			 */
			this.bind = function(name, fn) {
				var binding  = new EventBinding(name, fn, this);
				var bindings = this.getBindings(name);
				
				bindings.push(binding);
				return binding;
			}

			this.unbind = function(filter) {
				var BINDING = 'binding';
				var NAME = 'name';

				if( filter instanceof EventBinding ) {
					var match = BINDING;
					var name = filter.name;
				} else if( typeof(filter) == "string" ) {
					var match = NAME;
					var name = filter;
				}

				// Remove Bindings
				var bindings = this.getBindings(name);
				for( var i=0; i<bindings.length; i++ ) {
					var obinding = bindings[i];

					if(
						(match == BINDING && obinding == filter) ||
						(match == NAME && obinding.name == filter )
					) {
						bindings.splice(i, 1);
						i--;
					}
				}
			}

			/*
			 * Subscribe to events. Will trigger on future events, and execute previously _published_ events immediately.
			 * @param {string} topic - Topic to subscribe to. Will match subtopics too.
			 * @param {function} fn - Function that will be executed when triggered.
			 */
			this.subscribe = function(topic, fn) {
				var binding = this.bind(topic, fn);

				// Execute previously published matching events
				var events = this.getMatchingEvents(topic);
				for( var j=0; j<events.length; j++ ) {
					var e = events[j];
					if( e.match(topic) ) {
						binding.execute(e);
					}
				}
				return binding;
			}

			/**
			 * Trigger an event
			 * @param {string} name - Specify identifier
			 * @param {*} [arguments] - Arguments to be passed to callbacks. `this` is always the event itself.
			 */
			this.trigger = function(name, _args) {
				var args = Array.prototype.slice.call(arguments, 1);
				var e = new Event(name, args, this);
				return this.executeEvent(e);
			}

			/**
			 * Publish an event to future binds and previous subscriptions
			 */
			this.publish = function(name, _args) {
				var args = Array.prototype.slice.call(arguments, 1);

				var e = new Event(name, args, this);
				var parts = name.split(this.separator);
				for( var i=0; i<parts.length; i++ ) {
					var subname = parts.slice(0,i+1).join(this.separator);

					var bindings = this.getBindings(subname);
					for( var j=0; j<bindings.length; j++ ) {
						var binding = bindings[j];

						binding.execute(e);
					}
				}
				this.events.push(e);
				return e;
			}

			/**
			 * @private
			 */
			this.executeEvent = function(e) {
				var bindings = this.getBindings(e.name);
				for( var i=0; i < bindings.length; i++ ) {
					var binding = bindings[i];
					binding.execute(e);
				}
				return e;
			}

			/**
			 * Get a list of bindings.
			 * @param {string} name - Specifies which bindings
			 * @returns {Array}
			 */
			this.getBindings = function(name) {
				if( !(name in this.bindings) ) {
					this.bindings[name] = [];
				}
				return this.bindings[name];
			}

			/**
			 * Get a list of previously published events that match the topic.
			 * @param {string} topic - Topic to match against.
			 * @returns {Array}
			 */
			this.getMatchingEvents = function(topic) {
				var matchingevents = this.events.filter(function(e) {
					return e.match(topic);
				})
				return matchingevents;
			}

		}

		/**
		 * @class
		 */
		function Event(name, args, eventhandler) {
			this.name = name;
			this.args = args;
			this.eventhandler = eventhandler;
			/**
			 * Test whether the event matches against a topic.
			 * Topic 'foo' matches against this event 'foo.bar'.
			 * @param {string} Topic name. For example 'foo.bar'
			 * @returns {bool} Whether topic matches event name.
			 */
			this.match = function(topic) {
				var separator = this.eventhandler.separator;
				var topicparts = topic.split(separator);
				var substring = this.name.split(separator, topicparts.length).join(separator);
				var match = (topic == substring);
				return match;
			}
		}

		/**
		 * @class
		 */
		function EventBinding(name, fn, eventhandler) {
			this.name = name;
			this.fn   = fn;
			this.eventhandler = eventhandler;

			this.execute = function(event) {
				this.fn.apply(event, event.args);
			}
			this.unbind = function() {
				this.eventhandler.unbind(this);
			}
		}

		return {
			"EventHandler": EventHandler,
			"e": new EventHandler()
		};
	}

	if ( typeof define === 'function' && define.amd) {
		define([], Eventually);
	} else if( typeof module != 'undefined' ) {
		module.exports = Eventually();
	} else {
		root.Eventually = Eventually();
	}
})( typeof window === 'object' && window || this );
