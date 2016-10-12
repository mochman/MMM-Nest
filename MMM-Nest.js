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
		thermNum: "",
		displayType: "nest",
		displayName: false,
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
		this.chosenOne = 0;
		this.numberTherms = 1;

		this.thermName = [];
		this.ambientTemp = [];
		this.targetTemp = [];
		this.targetTempL = [];
		this.targetTempH = [];
		this.humidity = [];
		this.updateTimer = [];
		this.hvacState = [];
		this.hvacMode = [];

	},

	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		
		if (this.debugVar !== "") {
			wrapper.innerHTML = this.debugVar;
                        wrapper.className = "dimmed light xsmall";
                        return wrapper;
                }

                if (!this.loaded) {
                        wrapper.innerHTML = "Loading...";
                        wrapper.className = "dimmed light small";
                        return wrapper;
                }

		if (this.config.displayType === "list") {
			
			var table = document.createElement("table");
			table.classList.add("xsmall", "table");

			var headerRow = document.createElement("tr");
			var nameLabel = document.createElement("th");
			nameLabel.innerHTML = "Name";
			headerRow.appendChild(nameLabel);
			var currentLabel = document.createElement("th");
			currentLabel.innerHTML = "Ambient";
			currentLabel.className = "center";
			headerRow.appendChild(currentLabel);
			var setLabel = document.createElement("th");
			setLabel.className = "center";
                        setLabel.innerHTML = "Target";
                        headerRow.appendChild(setLabel);
			var humidityLabel = document.createElement("th");
			humidityLabel.className = "center";
                        humidityLabel.innerHTML = "Humidity";
                        headerRow.appendChild(humidityLabel);
			table.appendChild(headerRow);

			for (i = 0; i < this.numberTherms; i++) {
				var row = document.createElement("tr");
				var nameCell = document.createElement("td");
				nameCell.innerHTML = this.thermName[i];
				row.appendChild(nameCell);
				var currentCell = document.createElement("td");
				currentCell.className = "center";
				currentCell.innerHTML = this.ambientTemp[i] + "&deg;";
                                row.appendChild(currentCell);
				var setCell = document.createElement("td");
				if(this.hvacState[i] === "heating" ) {
                                        setCell.className = "center heatingCell";
                                } else if(this.hvacState[i] === "cooling") {
                                        setCell.className = "center coolingCell";
                                } else {
					setCell.className = "center";
				}
				if(this.hvacMode[i] === 'heat-cool') {
					setCell.innerHTML = this.targetTempL[i] + "&deg &bull; " + this.targetTempH[i] + "&deg;";
				} else {
                                	setCell.innerHTML = this.targetTemp[i] + "&deg;";
				}
                                row.appendChild(setCell);
				var humidityCell = document.createElement("td");
				humidityCell.className = "center";
                                humidityCell.innerHTML = this.humidity[i] + "%";
                                row.appendChild(humidityCell);

				table.appendChild(row);
			} 
			wrapper.appendChild(table);

		} else {
			var theName = document.createElement("div");

			if (this.hvacMode[this.chosenOne] === 'heat-cool') {
				wrapper.id = "circle";
				wrapper.className = this.hvacState[this.chosenOne] + "HC";
				wrapper.innerHTML = this.targetTempL[this.chosenOne] + " &bull; " + this.targetTempH[this.chosenOne];
			} else {
				wrapper.id = "circle";
				wrapper.className = this.hvacState[this.chosenOne];
				wrapper.innerHTML = this.targetTemp[this.chosenOne];
			}
			var theTemp = document.createElement("div");

			if (this.hvacState[this.chosenOne] === "cooling") {
			    theTemp.innerHTML = this.ambientTemp[this.chosenOne];
			    theTemp.className = "coolingText";
			    wrapper.appendChild(theTemp);
			} else if ( this.hvacState === "heating") {
			    theTemp.innerHTML = this.ambientTemp[this.chosenOne];
			    theTemp.className = "heatingText";
			    wrapper.appendChild(theTemp);
			} else if ( this.hvacMode !== 'heat-cool') {
				if (parseInt(this.ambientTemp[this.chosenOne]) < parseInt(this.targetTemp[this.chosenOne])) {
					theTemp.innerHTML = this.ambientTemp[this.chosenOne];
					theTemp.className = "heatingText";
					wrapper.appendChild(theTemp);
				} else if (parseInt(this.ambientTemp[this.chosenOne]) > parseInt(this.targetTemp[this.chosenOne])) {
					theTemp.innerHTML = this.ambientTemp[this.chosenOne];
					theTemp.className = "coolingText";
					wrapper.appendChild(theTemp);
				}
			}

			var theHumidity = document.createElement("div");
			theHumidity.innerHTML = this.humidity[this.chosenOne] + "%";
		    	theHumidity.className = "humidityText";
	   	 	wrapper.appendChild(theHumidity);
		
			if (this.config.displayName === true && this.thermName !== null) {
	                        theName.innerHTML = this.thermName[this.chosenOne];
				theName.className = "nameText";
	                        theName.appendChild(wrapper);
				return theName;
	                }
		}
		
		return wrapper;
	},


	getTemp: function() {
		if(this.config.token === "") {
			this.debugVar = "Please run getToken.sh and put your token in the config.js file";
			this.updateDom(this.config.animationSpeed);
		} else {
			var fullUrl = this.url + this.config.token;
			var self = this;
			var retry = true;

			var nestRequest = new XMLHttpRequest();
			nestRequest.open("GET", fullUrl, true);
			nestRequest.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						if(this.response == '{}') {
							self.debugVar = "Token works, but no data received.<br>Make sure you are using the master account.";
							self.updateDom(self.config.animationSpeed);
						} else {
							self.processTemp(JSON.parse(this.response));
						}
					} else {
						console.log("Nest Error - Status: " + this.status);
					}
				}
			};
			nestRequest.send();
			self.scheduleUpdate(self.updateInterval);
		}
	},

	processTemp: function(data) {
		this.numberTherms = Object.keys(data.thermostats).length;
		if (this.numberTherms > 1 && this.config.thermNum === "" && this.config.displayType !== "list") {
			this.debugVar = "Multiple thermostats detected<br>Please add either:";
			for (i = 0; i < this.numberTherms; i++) {
				tempVar = Object.keys(data.thermostats)[i];
				this.debugVar += "<br>thermNum:" + (i+1) + "&nbsp;&nbsp;&nbsp;&nbsp;//" + data.thermostats[tempVar].name_long.replace(/ *\([^)]*\) */g, "");;
			}
			this.debugVar += "<br>To your config.js file in the same area as your token";
			this.updateDom(this.config.animationSpeed);
		} else {
			for (i = 0; i < this.numberTherms; i++) {
				var keyVar = Object.keys(data.thermostats)[i];
				this.thermName[i] = data.thermostats[keyVar].name.replace(/ *\([^)]*\) */g, "");
				this.humidity[i] = data.thermostats[keyVar].humidity;
	                        this.hvacMode[i] = data.thermostats[keyVar].hvac_mode;
        	                this.hvacState[i] = data.thermostats[keyVar].hvac_state;
				if (this.config.units === 'imperial') {
					this.targetTempL[i] = data.thermostats[keyVar].target_temperature_low_f;
					this.targetTempH[i] = data.thermostats[keyVar].target_temperature_high_f;
					this.ambientTemp[i] = data.thermostats[keyVar].ambient_temperature_f;
					this.targetTemp[i] = data.thermostats[keyVar].target_temperature_f;
				} else {
					this.targetTempL[i] = data.thermostats[keyVar].target_temperature_low_c;
					this.targetTempH[i] = data.thermostats[keyVar].target_temperature_high_c;
					this.ambientTemp[i] = data.thermostats[keyVar].ambient_temperature_c;
					this.targetTemp[i] = data.thermostats[keyVar].target_temperature_c;
				}
			}
			if (this.numberTherms > 1) {
				this.chosenOne = this.config.thermNum - 1;
			}
			this.loaded = true;
                        this.debugVar = "";
                        this.updateDom(this.config.animationSpeed);
		} 
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
