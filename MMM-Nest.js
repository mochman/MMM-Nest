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
		thermNum: "",			//Which thermostat to show in visual mode
		protectNum: "",			//Which protect to show in visual mode
		displayType: "visual",		//Show a visual representation or list: "visual", "list"
		displayMode: "both",		//What to show: "nest", "protect", or "both"
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
		this.chosenNest = 0;
		this.chosenProt = 0;
		this.numberTherms = 1;
		this.numberProtects = 1;

		this.thermName = [];
		this.ambientTemp = [];
		this.targetTemp = [];
		this.targetTempL = [];
		this.targetTempH = [];
		this.humidity = [];
		this.fanOn = [];
		this.updateTimer = [];
		this.hvacState = [];
		this.hvacMode = [];
		
		this.protectName = [];
		this.coState = [];
		this.smokeState = [];
		this.batteryHealth = [];
		this.uiColor = [];

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
		 if(this.config.displayMode !== "protect" && this.numberTherms > 0) {
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
		   if (this.config.displayMode === "both" && this.numberProtects > 0) {
			var breakLine = document.createElement("br");
			table.appendChild(breakLine);
		   }
		   wrapper.appendChild(table);
		 } if (this.config.displayMode !== "nest" && this.numberProtects > 0) {
		 
		   var table2 = document.createElement("table");
                   table2.classList.add("xsmall", "table");
                   var headerRow2 = document.createElement("tr");
                   var nameLabel2 = document.createElement("th");
                   nameLabel2.innerHTML = "Name";
                   headerRow2.appendChild(nameLabel2);
                   var batteryLabel = document.createElement("th");
                   batteryLabel.innerHTML = "Battery";
                   batteryLabel.className = "center";
                   headerRow2.appendChild(batteryLabel);
                   var alarmLabel = document.createElement("th");
                   alarmLabel.className = "center";
                   alarmLabel.innerHTML = "Alarms";
                   headerRow2.appendChild(alarmLabel);
                   table2.appendChild(headerRow2);

		   for (i = 0; i < this.numberProtects; i++) {
                        var row2 = document.createElement("tr");
                        var nameCell2 = document.createElement("td");
                        nameCell2.innerHTML = this.protectName[i];
                        row2.appendChild(nameCell2);
                        var batteryCell = document.createElement("td");
                        batteryCell.className = "center";
                        batteryCell.innerHTML = this.batteryHealth[i];
                        row2.appendChild(batteryCell);
                        var alarmCell = document.createElement("td");
                        alarmCell.className = "center";
			if (this.smokeState[i] == "emergency" || this.coState[i] == "emergency") {
			   var wi = document.createElement("img");
                           wi.src = this.file("icons/warning-icon.png");
                           wi.className = "warningIcon";
                           alarmCell.appendChild(wi);
			   if(this.coState[i] == "emergency" && this.smokeState[i] == "emergency") {
                                alarmCell.innerHTML += "&nbsp;Both!";
                           } else if (this.coState[i] == "emergency") {
                                alarmCell.innerHTML += "&nbsp;CO";
                           } else {
                                alarmCell.innerHTML += "&nbsp;Smoke";
                           }
			} else if (this.smokeState[i] == "warning" || this.coState[i] == "warning") {
			   var ci = document.createElement("img");
                           ci.src = this.file("icons/caution-icon.png");
                           ci.className = "cautionIcon";
                           alarmCell.appendChild(ci);
			   if(this.coState[i] == "warning" && this.smokeState[i] == "warning") {
				alarmCell.innerHTML += "&nbsp;Both";
			   } else if (this.coState[i] == "warning") {
				alarmCell.innerHTML += "&nbsp;CO";
			   } else {
				alarmCell.innerHTML += "&nbsp;Smoke";
			   }
                        } else {
			   alarmCell.innerHTML = "ok";
			}
                        row2.appendChild(alarmCell);
                        table2.appendChild(row2);
		   }
		
		   wrapper.appendChild(table2);

		 }		 
		//Create a visual representation of the nest/protect
		} else {
		 if (this.config.displayMode !== "protect" ) {
		   //var theName = document.createElement("div");
		   if (this.hvacMode[this.chosenNest] === 'heat-cool') {
			wrapper.id = "circle";
			wrapper.className = this.hvacState[this.chosenNest] + "HC";
			wrapper.innerHTML = this.targetTempL[this.chosenNest] + " &bull; " + this.targetTempH[this.chosenNest];
		   } else {
			wrapper.id = "circle";
			wrapper.className = this.hvacState[this.chosenNest];
			wrapper.innerHTML = this.targetTemp[this.chosenNest];
		   }
		   var theTemp = document.createElement("div");
		   if (this.hvacState[this.chosenNest] === "cooling") {
			theTemp.innerHTML = this.ambientTemp[this.chosenNest];
			theTemp.className = "coolingText";
			wrapper.appendChild(theTemp);
		   } else if ( this.hvacState === "heating") {
			theTemp.innerHTML = this.ambientTemp[this.chosenNest];
			theTemp.className = "heatingText";
			wrapper.appendChild(theTemp);
		   } else if ( this.hvacMode !== 'heat-cool') {
			if (parseInt(this.ambientTemp[this.chosenNest]) < parseInt(this.targetTemp[this.chosenNest])) {
			   theTemp.innerHTML = this.ambientTemp[this.chosenNest];
			   theTemp.className = "heatingText";
			   wrapper.appendChild(theTemp);
		   	} else if (parseInt(this.ambientTemp[this.chosenNest]) > parseInt(this.targetTemp[this.chosenNest])) {
		 	   theTemp.innerHTML = this.ambientTemp[this.chosenNest];
			   theTemp.className = "coolingText";
			   wrapper.appendChild(theTemp);
		   	}
		   }

		   var theHumidity = document.createElement("div");
		   theHumidity.innerHTML = this.humidity[this.chosenNest] + "%";
		   theHumidity.className = "humidityText";
	   	   wrapper.appendChild(theHumidity);

		   if (this.fanOn[this.chosenNest] === true) {
		   	var fan = document.createElement("img");
		   	fan.src = this.file("icons/fan-icon.png");
		   	fan.className = "fanIcon";
		   	wrapper.appendChild(fan);
		   }
		 } if (this.config.displayMode === "both") {
		   var protectRing = document.createElement("div");
		   protectRing.className = this.uiColor[this.chosenProt] + "Both";
		   wrapper.appendChild(protectRing);

		 } if (this.config.displayMode === "protect") {
		   wrapper.id = "ring";
		   wrapper.className = this.uiColor[this.chosenProt] + "Ring";
		   if (this.uiColor[this.chosenProt] !== "green") {
			var batteryIcon = document.createElement("img");
			var displayText = document.createElement("p");
			displayText.className = "alarmText";

			if(this.coState[this.chosenProt] == "emergency") {
			   displayText.innerHTML = "CO";
			   wrapper.appendChild(displayText);
			} else if (this.smokeState[this.chosenProt] == "emergency") {
                           displayText.innerHTML = "Smoke";
			   wrapper.appendChild(displayText);
                        } else if (this.coState[this.chosenProt] == "warning") {
                           displayText.innerHTML = "CO";
			   wrapper.appendChild(displayText);
                        } else if (this.smokeState[this.chosenProt] == "warning") {
                           displayText.innerHTML = "Smoke";
			   wrapper.appendChild(displayText);
                        } else if (this.batteryHealth[this.chosenProt] == "replace") {
                           batteryIcon.src = this.file("icons/battery-icon.png");
                           batteryIcon.className = "batteryIcon";
                           wrapper.appendChild(batteryIcon);
			}
		   }

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
	   //Check to see if there are any thermostats and protects in the user's data
	   if(!data.thermostats) {
		this.numberTherms = 0;
	   } else {
		this.numberTherms = Object.keys(data.thermostats).length;
	   }
	   if(!data.smoke_co_alarms) {
		this.numberProtects = 0;
	   } else {
	   	this.numberProtects = Object.keys(data.smoke_co_alarms).length;
	   }

	   //If the user is using nest/protect view mode and there is more than 1, show the user
	   if (((this.numberTherms > 1 && this.config.thermNum == "") || (this.numberProtects > 1 && this.config.protectNum === "")) && this.config.displayType !== "list") {
		if(this.numberTherms > 1 && this.config.thermNum == "") {
		   this.debugVar = "Multiple thermostats detected<br>Please add either:";
		   for (i = 0; i < this.numberTherms; i++) {
		   	tempVar = Object.keys(data.thermostats)[i];
		   	this.debugVar += "<br>thermNum:" + (i+1) + "&nbsp;&nbsp;&nbsp;&nbsp;//" + data.thermostats[tempVar].name_long.replace(/ *\([^)]*\) */g, "");;
		   }
		}
		if(this.numberProtects > 1 && this.config.protectNum == "") {
		   this.debugVar += "Multiple Protects detected<br>Please add either:";
                   for (i = 0; i < this.numberProtects; i++) {
                   	tempVar = Object.keys(data.smoke_co_alarms)[i];
                   	this.debugVar += "<br>protectNum:" + (i+1) + "&nbsp;&nbsp;&nbsp;&nbsp;//" + data.smoke_co_alarms[tempVar].name_long.replace(/ *\([^)]*\) */g, "");;
                   }
		}
		this.debugVar += "<br>To your config.js file in the same area as your token<br>";
		this.updateDom(this.config.animationSpeed);

           //Get Thermostat data if user wants to see it and there are actual thermostats
	   } else {
	    if (this.config.displayMode != "protect" && this.numberTherms > 0) {
		for (i = 0; i < this.numberTherms; i++) {
		   var keyVar = Object.keys(data.thermostats)[i];
		   this.thermName[i] = data.thermostats[keyVar].name.replace(/ *\([^)]*\) */g, "");
		   this.humidity[i] = data.thermostats[keyVar].humidity;
		   this.fanOn[i] = data.thermostats[keyVar].fan_timer_active;
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
		   this.chosenNest = this.config.thermNum - 1;
		}

	    }  if (this.config.displayMode !== "nest" && this.numberProtects > 0) {
                for (i = 0; i < this.numberProtects; i++) {
                   var keyVar = Object.keys(data.smoke_co_alarms)[i];
                   this.protectName[i] = data.smoke_co_alarms[keyVar].name.replace(/ *\([^)]*\) */g, "");
                   this.batteryHealth[i] = data.smoke_co_alarms[keyVar].battery_health;
		   this.coState[i] = data.smoke_co_alarms[keyVar].co_alarm_state;
		   this.smokeState[i] = data.smoke_co_alarms[keyVar].smoke_alarm_state;
		   this.uiColor[i] = data.smoke_co_alarms[keyVar].ui_color_state;
                }
                if (this.numberProtects > 1) {
                   this.chosenProt = this.config.protectNum - 1;
                }
           }
	   this.loaded = true;
	   if( this.numberProtects == 0 && this.numberTherms == 0 ) {
		this.debugVar = "It looks like there are no Thermostats or Protects in this account.";
	   } else {
              this.debugVar = "";
           }
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
