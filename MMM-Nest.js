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
		units: config.units,
		updateInterval: 60 * 1000, // updates every minute per Nest's recommendation
		animationSpeed: 2 * 1000,
		initialLoadDelay: 0
		
	},
	// Define required scripts.
	getStyles: function() {
		return ["MMM-Nest.css"];
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
		this.hvacState = null;
		this.hvacMode = null;

	},

	// Override dom generator.
	getDom: function() {
	  
		var wrapper = document.createElement("div");
		wrapper.id = "circle";
		wrapper.className = this.hvacState;
		wrapper.innerHTML = this.targetTemp;
		
		var theTemp = document.createElement("div");
		
		if (this.hvacState === "cooling") {
		    theTemp.innerHTML = this.ambientTemp;
		    theTemp.className = "coolingText";
		    wrapper.appendChild(theTemp);
		} else if ( this.hvacState === "heating") {
		    theTemp.innerHTML = this.ambientTemp;
		    theTemp.className = "heatingText";
		    wrapper.appendChild(theTemp);
		}
		
		var theHumidity = document.createElement("div");
		    theHumidity.innerHTML = this.humidity + "%";
		    theHumidity.className = "humidityText";
		    wrapper.appendChild(theHumidity);
		
		
		
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
		this.hvacMode = data.thermostats[keyVar].hvac_mode;
		this.hvacState = data.thermostats[keyVar].hvac_state;
		if (this.hvacMode === 'heat-cool'){
				if (this.config.units === 'imperial') {
					if (this.hvacState === 'cooling') {
						this.targetTemp = data.thermostats[keyVar].target_temperature_low_f;
					} else if (this.hvacState === 'heating') {
						this.targetTemp = data.thermostats[keyVar].target_temperature_high_f;
					}
					this.ambientTemp = data.thermostats[keyVar].ambient_temperature_f;
				} else {
					if (this.hvacState === 'cooling') {
						this.targetTemp = data.thermostats[keyVar].target_temperature_low_c;
					} else if (this.hvacState === 'heating') {
						this.targetTemp = data.thermostats[keyVar].target_temperature_high_c;
					}
					this.ambientTemp = data.thermostats[keyVar].ambient_temperature_c;
				}
		} else {
				if (this.config.units === 'imperial') {
					this.ambientTemp = data.thermostats[keyVar].ambient_temperature_f;
					this.targetTemp = data.thermostats[keyVar].target_temperature_f;
				} else {
					this.ambientTemp = data.thermostats[keyVar].ambient_temperature_c;
					this.targetTemp = data.thermostats[keyVar].target_temperature_c;
				}
		}
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