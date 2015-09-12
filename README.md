# Bussed

Offers real-time information for all buses, overlaid on top of a map for easy
viewing.
This is an Apache Cordova frontend to the bussedly backend server which returns
the actual real-time information.

# Developer Installation

NodeJS and npm is required. Project files are supplied for Visual Studio 2015.

## Windows-specific steps

Assumes you have installed Chocolatey (you have done this, right?):

	choco install nodejs.install

## Initial Setup

	npm install -g cordova
	cordova platform add wp8
	cordova platform add android