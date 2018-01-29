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

        var self = this;
        document.getElementById("soundtest").addEventListener("click", function() {

            document.getElementById('alarm').innerHTML = "start playing sound";
            self.playSound();
        });
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        /* from https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-device-motion/index.html */
        var options = { frequency: 2000 };
        var watchID = navigator.accelerometer.watchAcceleration(this.onSuccess, this.onError, options);
    },

    onSuccess: function(acceleration) {

        document.getElementById('accelerationX').innerHTML = Math.abs(acceleration.x);
        document.getElementById('accelerationY').innerHTML = acceleration.y;
        document.getElementById('accelerationZ').innerHTML = acceleration.z;

        var threshold = 0.3;
        var thresholdExceeded = false;

        if (Math.abs(acceleration.x) > threshold) {
            document.getElementById('accelerationX').setAttribute('class', 'thresholdExceeded');
            thresholdExceeded = true;
        } else {
            document.getElementById('accelerationX').setAttribute('class', 'thresholdOk');
        }

        if (Math.abs(acceleration.y) > threshold) {
            document.getElementById('accelerationY').setAttribute('class', 'thresholdExceeded');
            thresholdExceeded = true;
        } else {
            document.getElementById('accelerationY').setAttribute('class', 'thresholdOk');
        }

        if (Math.abs(acceleration.z) > threshold) {
            document.getElementById('accelerationZ').setAttribute('class', 'thresholdExceeded');
        } else {
            document.getElementById('accelerationZ').setAttribute('class', 'thresholdOk');
        }


        if (thresholdExceeded) {

            document.getElementById('alarm').setAttribute('class', 'thresholdExceeded');
            app.playSound();

        } else {
            document.getElementById('alarm').setAttribute('class', 'thresholdOk');
        }

    },

    playSound: function() {

        document.getElementById('alarm').innerHTML = "play sound";

        var media = new Media(this.getMediaURL("sounds/sirene.mp3"),
            this.mediaSuccess,
            this.mediaError,
            this.mediaStatus);
        media.play();
    },

    getMediaURL: function(s) {
        if (cordova.platformId.toLowerCase() === "android") return "/android_asset/www/" + s;
        return s;
    },

    mediaSuccess: function() {

        document.getElementById('alarm').innerHTML = "media played";
    },

    mediaError: function(e) {

        document.getElementById('alarm').innerHTML = JSON.stringify(e);
    },

    mediaStatus: function(status) {

        document.getElementById('alarm').innerHTML = "status: " + status;
    },

    onError: function() {

        document.getElementById('accelerationX').innerHTML = "error";
    }
};

app.initialize();