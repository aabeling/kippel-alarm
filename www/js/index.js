/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var alarmSound = {

    isPlaying: false,
    mediaStarted: null,
    mediaStopped: null,
    media: null,

    initialize: function() {

        this.media = new Media(this.getMediaURL("sounds/sirene.mp3"),
            this.mediaSuccess,
            this.mediaError,
            this.mediaStatus);

    },

    /**
     * Plays the alarm sound or does nothing if the sound is currently playing
     */
    playSound: function(mediaStarted, mediaStopped) {

        if (this.isPlaying) {
            console.log("already playing");
            return;
        }

        this.mediaStarted = mediaStarted;
        this.mediaStopped = mediaStopped;

        this.isPlaying = true;
        this.media.play();
    },

    getMediaURL: function(s) {
        if (cordova.platformId.toLowerCase() === "android") return "/android_asset/www/" + s;
        return s;
    },

    mediaStatus: function(status) {

        console.log("mediaStatus: " + status);

        if (status == Media.MEDIA_STARTING) {
            alarmSound.isPlaying = true;
            alarmSound.mediaStarted();
        } else if (status == Media.MEDIA_STOPPED) {
            alarmSound.isPlaying = false;
            alarmSound.mediaStopped();
        }
    },

    mediaSuccess: function() {

        console.log("mediaSuccess");
        alarmSound.isPlaying = false;
    },

    mediaError: function(e) {

        console.log("mediaError: " + e);
        alarmSound.isPlaying = false;
    }
};

var sensor = {

    watchId: null,
    /**
     * 0: not calibrated,
     * 1: calibrating
     * 2: calibrated and running
     */
    status: 0,
    onStatusChange: null,
    onThresholdExceeded: null,
    calibratedAcceleration: null,

    initialize: function(onStatusChange, onThresholdExceeded) {

        var options = { frequency: 500 };
        sensor.watchId = navigator.accelerometer.watchAcceleration(
            sensor.onSuccess,
            sensor.onError,
            options);

        sensor.onStatusChange = onStatusChange;
        sensor.onThresholdExceeded = onThresholdExceeded;
        sensor.setStatus(0);
    },

    setStatus: function(status) {

        sensor.status = status;
        sensor.onStatusChange(status);
    },

    calibrate: function() {

        console.log("calibrate");
        sensor.setStatus(1);
    },

    stop: function() {

        sensor.setStatus(0);
    },

    checkAcceleration: function(acceleration) {

        var threshold = 0.3;

        if (Math.abs(acceleration.x - sensor.calibratedAcceleration.x) > threshold) {
            sensor.onThresholdExceeded();
        }

        if (Math.abs(acceleration.y - sensor.calibratedAcceleration.y) > threshold) {
            sensor.onThresholdExceeded();
        }

        if (Math.abs(acceleration.z - sensor.calibratedAcceleration.z) > threshold) {
            sensor.onThresholdExceeded();
        }
    },

    /**
     * Called by the navigator.accelerometer.
     */
    onSuccess: function(acceleration) {

        if (sensor.status == 1) {
            sensor.calibratedAcceleration = acceleration;
            sensor.setStatus(2);
            console.log("calibrated with " + JSON.stringify(acceleration));
        } else if (sensor.status == 2) {
            sensor.checkAcceleration(acceleration);
        }
    },

    /**
     * Called by the navigator.accelerometer.
     */
    onError: function() {

        console.log("error from navigator.accelerometer");
    }
};

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {

        this.receivedEvent('deviceready');
        alarmSound.initialize();
        cordova.plugins.backgroundMode.enable();

        var soundTestButton = document.getElementById("soundtest");
        soundTestButton.addEventListener("click", function() {

            alarmSound.playSound(function() {
                soundTestButton.disabled = true;
            }, function() {
                soundTestButton.disabled = false;
            });
        });

        var calibrateButton = document.getElementById("calibrate");
        calibrateButton.addEventListener("click", function() {
            calibrateButton.disabled = true;
            setTimeout(function() {
                sensor.calibrate();
            }, 10000);
        });

        var stopButton = document.getElementById("stop");
        stopButton.addEventListener("click", function() {
            sensor.stop();
        });

        sensor.initialize(this.sensorStatusChanged, this.sensorThresholdExceeded);
    },

    sensorStatusChanged: function(status) {

        var infoElement = document.getElementById("info");

        if (status == 0) {
            document.getElementById("stop").disabled = true;
            infoElement.innerHTML = "sensor: off";
        } else if (status == 1) {
            infoElement.innerHTML = "sensor: calibrating";
        } else if (status == 2) {
            /* sensor is running */
            infoElement.innerHTML = "sensor: running";
            document.getElementById("stop").disabled = false;
            document.getElementById("calibrate").disabled = false;
            document.getElementById("calibrate").innerHTML = "Recalibrate";
        }
    },

    sensorThresholdExceeded: function() {

        document.getElementById("info").innerHTML = "threshold exceeded";
        alarmSound.playSound(function() {
            /* intentionally left blank */
        }, function() {
            /* intentionally left blank */
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }

};

app.initialize();