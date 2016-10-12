# Module: MMM-Nest
The `MMM-Nest` module is a <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> addon.
This module displays your <a href="https://www.nest.com">Nest's</a> data on your Mirror

<table width="100%" style="center">
<tr>
<td>Nest Display Mode (Only 1 Thermostat at a time)</td>
<td>List Display Mode (Good for multiple Thermostats)</td>
</tr>
<tr>
<td><img src="https://cloud.githubusercontent.com/assets/19363185/17138689/754130ba-530f-11e6-855a-d3c3142f36eb.png"</td>
<td><img src="https://cloud.githubusercontent.com/assets/19363185/19297396/826b8214-9012-11e6-8287-313428602562.png"</td>
</tr>
</table>

## Installing the module
run `git clone https://github.com/mochman/MMM-Nest.git` from inside your `MagicMirror/modules` folder

## Getting the Nest Token
Run getToken.sh.  This will walk you through getting a token to allow this module to get data from your Nest.  It requires you to set up a Nest Developer Account.

## Known Issues
If you have a family account, make sure you get the PIN with your master account's login (not a account you shared the thermostat with).

## Using the module
To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-Nest',
		position: 'bottom_right',	// This can be any of the regions.
									// Best results in one of the side regions like: top_left
		config: {
			// See 'Configuration options' for more information.
			token: '1234567890zbcdefghijkl', //Nest Token - REQUIRED
			thermNum: 3, //Choose which thermostat - REQUIRED if you have multiple thermostats on the same account
			displayName: true, //Display the thermostat name
			displayType: "nest" //Choose either the Nest display or a list
		}
	}
]
````

## Choosing your thermostat
Do not enter a `thermNum:` in your config.js.  The module will list your available thermostats.  You will then be presented with a list of your thermostats to pick from.

![Choose Thermostat](https://cloud.githubusercontent.com/assets/19363185/19137765/4768b484-8b44-11e6-8441-e9b43c3f32fd.png)

## Configuration options
The following properties can be configured:


<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>token</code></td>
			<td>Used to get data from your Nest<br>
				<br><b>Example:</b> <code>c.alkjsfkljadsfj234....</code>
				<br> This value is <b>REQUIRED</b>
			</td>
		</tr>
		<tr>
			<td><code>thermNum</code></td>
			<td>Used to choose which thermostat is shown<br>
				<br><b>Example:</b> <code>2</code>
				<br> This value is <b>REQUIRED only if you have multiple thermostats</b>
			</td>
		</tr>
		<tr>
			<td><code>displayName</code></td>
			<td>Display the thermostat name<br>
				<br><b>Example:</b> <code>true</code>
				<br><b>Default value:</b> <code>false</code>
			</td>
		</tr>
		<tr>
                        <td><code>displayType</code></td>
                        <td>Choose how the data is displayed<br>
                                <br><b>Possible values:</b> <code>"list"</code>, <code>"nest"</code>
                                <br><b>Default value:</b> <code>"nest"</code>
                        </td>
                </tr>
		<tr>
			<td><code>units</code></td>
			<td>What units to use. Specified by config.js<br>
				<br><b>Possible values:</b> <code>config.units</code> = Specified by config.js, <code>metric</code> = Celsius, <code>imperial</code> =Fahrenheit
				<br><b>Default value:</b> <code>config.units</code>
			</td>
		</tr>
		<tr>
			<td><code>updateInterval</code></td>
			<td>How often this refreshes<br>
				<br><b>Example:</b> <code>60000</code>
				<br> Nest recommends a call every minute or greater.
				<br><b>Default value:</b> <code>60000</code>
			</td>
		</tr>
	</tbody>
</table>
