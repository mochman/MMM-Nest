/* global Module */

/* Magic Mirror
 * Module: MMM-Nest
 *
 * By Luke Moch
 * MIT Licensed.
 */

Module.register("MMM-Nest",{

	// Default module config.
	defaults: {
		token: "",
		updateInterval: 5 * 1000,
		animationSpeed: 2 * 1000,
		initialLoadDelay: 0
	},



	// Define start sequence.
	start: function() {
		Log.info("Starting module: " + this.name);
		this.debugVar = "";

		this.url = "https://developer-api.nest.com/devices?auth=";
		this.loaded = false;
		this.scheduleUpdate(this.config.initialLoadDelay);

		
		this.ambientTemp = null;
		this.targetTemp = null;
		this.humidity = null;
		this.updateTimer = null;

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");

		if (this.debugVar !== "") {
			wrapper.innerHTML = this.debugVar;
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		
		if (!this.loaded) {
			wrapper.innerHTML = "Loading...";
			wrapper.className = "dimmed light small";
			return wrapper;
		}
		wrapper.innerHTML = "Target Temp = " + this.targetTemp + "<br>Ambient Temp = " + this.ambientTemp+ "<br>Humidity = " + this.humidity;
		return wrapper;
	},


	getTemp: function() {
		var fullUrl = this.url + this.config.token;
		var self = this;
		var retry = true;

		var nestRequest = new XMLHttpRequest();
		nestRequest.open("GET", fullUrl, true);
		nestRequest.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.status === 200) {
					self.processTemp(JSON.parse(this.response));
				} else {
					console.log("Status: " + this.status);
				}

			}
		};
		nestRequest.send();
		self.scheduleUpdate(self.updateInterval);
	},

	processTemp: function(data) {
		var keyVar = Object.keys(data.thermostats);
		this.humidity = data.thermostats[keyVar].humidity;
		this.ambientTemp = data.thermostats[keyVar].ambient_temperature_f;
		this.targetTemp = data.thermostats[keyVar].target_temperature_f;
		this.loaded = true;
		this.updateDom(this.config.animationSpeed);
	},


	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.getTemp();
		}, nextLoad);
	},


});
