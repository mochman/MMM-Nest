# Module: MMM-Nest
The `MMM-Nest` module is a <a href="https://github.com/MichMich/MagicMirror">MagicMirror</a> addon.
This module displays your <a href="https://www.nest.com">Nest's</a> data on your Mirror

![Nest Displays](https://cloud.githubusercontent.com/assets/19363185/17138689/754130ba-530f-11e6-855a-d3c3142f36eb.png)

## Installing the module
run `git clone https://github.com/mochman/MMM-Nest.git` from inside your `MagicMirror/modules` folder 

## Getting the Nest Token
Run getToken.sh.  This will walk you through getting a token to allow this module to get data from your Nest.  It requires you to set up a Nest Developer Account.

## Known Issues
This module has only been tested with houses with one Nest Thermostat.  It doesn't work with "family accounts" and I don't know how it will act with multiple thermostats on the same account.  If you have a family account, make sure you get the PIN with your master account's login.

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
			token: '1234567890zbcdefghijkl' //Nest Token - REQUIRED

		}
	}
]
````

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
