# Bussed

Offers real-time information for all buses, overlaid on top of a map for easy
viewing.
This is an Apache Cordova frontend to the bussedly backend server which returns
the actual real-time information.

A version of this is now live on the [Google Play store](https://play.google.com/store/apps/details?id=com.glicsoft.bussed)
and the [Windows Phone store](http://windowsphone.com/s?appid=0ce94fe7-3014-4a1c-8e14-fff6da291e83).

# Developer Installation

NodeJS 4.x+ and npm is required. Project files are supplied for Visual Studio 2015.
The [Android SDK Tools](http://developer.android.com/sdk/installing/index.html?pkg=tools)
must be installed for Android support.

## Windows-specific steps

Assumes you have installed Chocolatey (you have done this, right?):

    choco install nodejs.install

## Ubuntu Linux

    sudo apt-get install nodejs npm
    sudo ln -s /usr/bin/nodejs /usr/bin/node

For later versions of Node, use the [debsource](https://github.com/nodesource/distributions)
instructions:

    curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
    sudo apt-get install -y nodejs

## Initial Setup

    npm install -g cordova
    npm install -g ripple-emulator
    cordova prepare
    cordova platform add wp8
    cordova platform add android

# Testing

## Emulating

Runs the Ripple emulator:

    cordova prepare android
    ripple emulate

Set the fixed geo-location to a reasonable location e.g. 51.8968920,-8.4863160

## On Device

Start the app via cordova CLI (you may be asked to confirm the RSA key):

    cordova run android

Once started, open the following URL in any Chrome-based browser:

    chrome://inspect/#devices

and click the Inspect link for the application.

# Generate Resources

There is a script that generates all icons and graphics from a single base image
to avoid the tedious cropping/scaling needed. Python 3.4+ and a recent
version of Pillow is required to run it:

    python -m scripts.img_create res/bus_original.png res.yaml

# Building Release

## Android

The Android keystore must exist in the android directory relative to the bussed
directory and the command must be run with Node 4.x+ installed

    cordova build android --release --buildConfig build.json
