#!/bin/bash

clear
echo "This script will walk you through getting a Nest Token."
echo "The first thing you'll have to do is create a developer account."
echo "Please copy and paste this URL into the browser of your choice."
echo -e "\033[01;32m"
echo "https://developers.nest.com/nl/auth/new"
echo -e "\e[0m"
echo "Create a new devloper login by clicking on"
echo ""
echo "\"Don't have an account? Sign up>\""
echo ""
echo "After you sign up, log in then come back to this script for how to continue."
echo -n "Press any button to continue..."
read -n 1 -s
echo ""
echo ""
echo "Great!  You have an account.  Now click on \"Create cloud product\""
echo "Fill out every required section, along with \"Thermostat\" & \"Protect\" in the Permissions Section."
echo "You can make it read or read/write, it doesnt matter for this module."
echo "Click on Create Project and fill out any extra required fields you missed."
echo ""
echo "Almost there, now open up your project page and get ready to copy some of the"
echo "data on the right side to input here:"
echo ""
echo ""
echo -n "Input Product ID: "
read productID
echo -n "Input Product Secret: "
read productSecret
echo ""
echo ""
echo "Copy this URL into your browser, log in with your nest account info.  After that you'll be given a PIN."
echo -e "\033[01;32m"
echo "https://home.nest.com/login/oauth2?client_id=$productID&state=goodState"
echo -e "\e[0m"
echo "Copy that PIN and paste it in this script when asked."
echo -n "Press any button to continue..."
read -n 1 -s
echo ""
echo -n "Please input the PIN that was provided: "
read PIN

IP=$(curl -s -X POST "https://api.home.nest.com/oauth2/access_token" -d "code=$PIN" -d "client_id=$productID" -d "client_secret=$productSecret" -d "grant_type=authorization_code") > /dev/null
echo ""
echo ""
echo "Place the following in your conifg.js file"
echo ""
echo "		{"
echo "			module: 'MMM-Nest',"
echo "			position: 'top_left',"
echo "			config: {"
echo -n "				token:\""
echo -n "$IP" | sed -e 's/{"access_token":"//' -e 's/","expires_in":[0-9]*}//'
echo "\""
echo "			}"
echo "		}"
echo ""
echo ""
echo -n "Press any button to exit..."
read -n 1 -s
