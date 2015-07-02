angular.module('PreWarningSystem.services', []).factory("Contacts", function () {
        var Contacts = {};

        Contacts.list = [];
        Contacts.channels = [];
        Contacts.contactsLastRefreshed = null;
        Contacts.channelsLastRefreshed = null;
        Contacts.addContact = function (contact) {
            Contacts.list.push(contact);
            Contacts.contactsLastRefreshed = new Date();
            console.log("Contacts Refreshed on :" + Contacts.contactsLastRefreshed);
        };
        Contacts.addChannel = function (channel) {
            Contacts.channels.push(channel);
            Contacts.channelsLastRefreshed = new Date();
            console.log("Channels Refreshed on :" + Contacts.channelsLastRefreshed);
        };
        Contacts.updateContactsList = function (contacts) {
            Contacts.list = contacts;
            Contacts.contactsLastRefreshed = new Date();
            console.log("Contacts Refreshed on :" + Contacts.contactsLastRefreshed);
        };
        Contacts.updateChannelsList = function (channels) {
            Contacts.channels = channels;
            Contacts.channelsLastRefreshed = new Date();
            console.log("Channels Refreshed on :" + Contacts.channelsLastRefreshed);
        };
        Contacts.clearContacts = function () {
            Contacts.list = [];
        };
        Contacts.clearChannels = function () {
            Contacts.channels = [];
        };

        return Contacts;
    })
    .factory('$localstorage', ['$window', function ($window) {
        return {
            set: function (key, value) {
                $window.localStorage[key] = value;
            },
            get: function (key, defaultValue) {
                return $window.localStorage[key] || defaultValue;
            },
            setObject: function (key, value) {
                $window.localStorage[key] = JSON.stringify(value);
            },
            getObject: function (key) {
                return JSON.parse($window.localStorage[key] || '{}');
            }
        };
}])

.service("SettingsService", [function () {
        var settings = {

            'delayTime': 2000, // in milli seconds
            'isOffline': false,
            'audioSrc': {
                'left': 'media/see_left.mp3',
                'right': 'media/see_right.mp3',
            },
            'vibrationEnabled': true,
            'soundEnabled': true,
            'vibrationDuration': 1000,
            'vibrationDelay': 100,
            'vibrationRepeat': 2,
            'backgroundModeEnabled': true, //Set this to true to get notificaitons in the background.

        };
        var _setOfflineStatus = function (status) {
            settings.isOffline = status;
        };
        var _setVibrationStatus = function (status) {
            settings.vibrationEnabled = status;
        };
        var _setSoundStatus = function (status) {
            settings.soundEnabled = status;
        };
        var _setVibrationPattern = function (pattern) {
            if (pattern.length === 3) {
                settings.vibrationDuration = pattern[0];
                settings.vibrationDelay = pattern[1];
                settings.vibrationRepeat = pattern[2];
            }
        };
        var _setDelayTime = function (delay) {
            settings.delayTime = delay;
        };

        return {
            settings: settings,
            setOfflineStatus: _setOfflineStatus,
            setVibrationStatus: _setVibrationStatus,
            setVibrationPattern: _setVibrationPattern,
            setSoundStatus: _setSoundStatus,
            setDelayTime: _setDelayTime
        };
    }])
    .service('NotifyService', ['SettingsService', '$cordovaToast',
    function (SettingsService, $cordovaToast) {
            var _lastPush = {
                timeDifference: 1234,
                notification: {
                    carDirection: "left",
                    carSpeed: "verFast"
                }
            };
            var _getLastPush = function () {
                return _lastPush;
            };

            var _toast = function (text) {
                try {
                    $cordovaToast.showLongBottom(text);
                } catch (e) {
                    _log(text);
                }
            };
            var _log = function (text) {
                console.log("NotifyService: " + text);
            };

            var _vibrate = function (time) {
                navigator.vibrate(time);
            };
            var _vibrateWithPattern = function (pattern) {
                //[vibrationDuration,vibrationDelay,vibrationRepeat] = [1000, 100, 2]
                for (var i = 0; i < pattern[2]; i++) {
                    setInterval(_vibrate(pattern[0]), pattern[1]);
                }
            };

            var _playSound = function (notification) {
                var audio = document.getElementById("audio");
                if (notification.carDirection == "left")
                    audio.src = SettingsService.settings.audioSrc.left;
                else if (notification.carDirection == "right")
                    audio.src = SettingsService.settings.audioSrc.right;
                audio.play();
            };

            var _saveLastPush = function (push) {
                push.timeDifference = _getTimeDiff(push.timeReceived, push.timeSent);
                _lastPush = push;
            };

            var _notify = function (push) {
                //First Save the notification
                _saveLastPush(push);
                var settings = push.settings;
                var notification = push.notification;

                _log("Notifying User");
                if (settings.soundEnabled) {
                    _playSound(notification);
                    _log("Played Sound");
                }
                if (settings.vibrationEnabled) {
                    _vibrateWithPattern(settings.vibrationPattern);
                    _log("Doing Vibration");
                }

            };

            var secondsToHMS = function (secs) {
                function z(n) {
                    return (n < 10 ? '0' : '') + n;
                }
                var sign = secs < 0 ? '-' : '';
                secs = Math.abs(secs);
                return sign + z(secs / 3600 | 0) + ':' + z((secs % 3600) / 60 | 0) + ':' + z(secs % 60);
            };

            var _getTimeDiff = function (timeReceived, timeSent) {
                var diffMilliseconds = timeReceived - timeSent;
                var diffSeconds = diffMilliseconds / 1000;
                _toast("Time Difference: " + diffMilliseconds);
                return secondsToHMS(diffSeconds);
            };
            return {
                toast: _toast,
                notify: _notify,
                lastPush: _lastPush,
                getLastPush: _getLastPush,
            };

    }])
    .service('BackgroundService', ['SettingsService', '$cordovaToast',
    function (SettingsService, $cordovaToast) {

            var _enable = function () {
                if(cordova.plugins.backgroundMode){
                    cordova.plugins.backgroundMode.enable();
                    if(_isEnabled)
                    _toast("BackgroundService Enabled");
                }
                else{
                    _toast("BackgroundService Not Available");
                }
            };
            var _disable = function () {
                if(cordova.plugins.backgroundMode){
                    cordova.plugins.backgroundMode.disable();
                    if(!_isEnabled)
                    _toast("BackgroundService Disabled");
                }
                else{
                    _toast("BackgroundService Not Available");
                }
            };
            var _isEnabled = function () {
                return cordova.plugins.backgroundMode.isEnabled();
            };
        
            var _toggleBackgroundMode = function () {
                if (_isEnabled()) {
                    _disable();
                } else {
                    _enable();
                }
            };

            var _toast = function (text) {
                try {
                    $cordovaToast.showLongBottom(text);
                } catch (e) {
                    _log(text);
                }
            };
            var _log = function (text) {
                console.log("NotifyService: " + text);
            };

            return {
                toggleBackgroundMode: _toggleBackgroundMode,
                isEnabled: _isEnabled,
                enable: _enable,
            };

    }])
    .service('ParseService', ['$q', 'Contacts', 'SettingsService', 'NotifyService',
    function ($q, Contacts, SettingsService, NotifyService) {
            /**
             *   Variables and constants
             */
            var _appId = "xT5AKbQJvofdDgjUBzJhFPgTeuPZ97ux854Biy31";
            var _clientKey = "PsNI6F4VeSO0m2yaHLn6uYnoaN8X7sbUJ7nOj1wE";
            var _jsKey = "YNFW7qk1gKUIxE2RiOGJFKIPyGtdorus8E1mPCyr";
            var _restAPIKey = "gJwHkPD7RtIrF1kqLyg1rqbtvcRKeitNijAKXcAg";

            /**
             *   Functions
             */

            var _init = function () {
                var deferred = $q.defer();
                //Register the app
                Parse.initialize(_appId, _jsKey);

                _log("Called Parse Init Service");

                //Check if any user is registered.
                if (_getCurrentUser()) {
                    //User Present
                    deferred.resolve(_getCurrentUser());
                } else {
                    //User Not Present
                    _log("No user present");
                    deferred.reject("No User Logged In");
                }

                return deferred.promise;
            };

            var _refreshContactsList = function () {
                var query = new Parse.Query(Parse.User);
                query.find({
                    success: function (contacts) {
                        var contactsJson = JSON.parse(JSON.stringify(contacts));
                        var contactsList = [];
                        for (var i = 0; i < contactsJson.length; i++) {
                            contactsList.push(contactsJson[i]);
                            //                        console.log(JSON.stringify(results[i]));
                        }
                        Contacts.updateContactsList(contactsList);
                    }
                });
            };

            var _refreshChannelsList = function (params) {
                var channelsObj = Parse.Object.extend("Channels");
                var query = new Parse.Query(channelsObj);

                if (params !== undefined) {
                    if (params.channel !== undefined) {
                        query.equalTo("name", params.channel);
                        console.log("Querying : " + params.channel);
                    }
                }
                query.find({
                    success: function (results) {
                        var resultsj = JSON.parse(JSON.stringify(results));
                        console.log("Successfully retrieved " + results.length + " channels.");
                        // Clear Contacts first
                        Contacts.clearChannels();
                        //Populate Contacts
                        var channels = [];
                        for (var i = 0; i < resultsj.length; i++) {
                            channels.push(resultsj[i]);
                            //                        console.log(JSON.stringify(results[i]));
                        }

                        Contacts.updateChannelsList(channels);
                        console.log(JSON.stringify(Contacts.channels));

                    },
                    error: function (error) {
                        alert("Error: " + error.code + " " + error.message);
                    }
                });
            };

            var _getContacts = function () {
                if (Contacts.contactsLastRefreshed === null)
                    _refreshContactsList();

                //            console.log("Get Contacts: " + JSON.stringify(Contacts.list));
                return Contacts.list;
            };
            var _getChannels = function () {
                if (Contacts.channelsLastRefreshed === null)
                    _refreshChannelsList();

                //            console.log("Get Channels: " + JSON.stringify(Contacts.channels));
                return Contacts.channels;
            };

            var _getCurrentUser = function () {

                var currentUser = Parse.User.current();
                if (currentUser) {
                    return currentUser;
                } else {
                    return null;
                }
            };


            var _login = function (username, password) {
                //Logout current user
                Parse.User.logOut();

                var deferred = $q.defer();

                Parse.User.logIn(username, password, {
                    success: function (user) {
                        _toast("Hello " + user.username);
                        return deferred.resolve(user);
                    },
                    error: function (user, error) {
                        _toast("Error Logging in user: " + user.username + " Error: " + error);
                        return deferred.reject(user);
                    }
                });
                return deferred.promise;

            };
            var _logout = function () {
                if (_getCurrentUser())
                    _log("Loging out current user with username:" + JSON.stringify(_getCurrentUser()));
                else
                    _log("No user to logout " + JSON.stringify(_getCurrentUser()));
                Parse.User.logOut();
            };
            var _signUp = function (username, password, firstName, lastName, email, groups) {

                //Logout current user
                Parse.User.logOut();

                //Creating new User
                var user = new Parse.User();
                //Min required for using Parse signup feature
                user.set("username", username);
                user.set("password", password);
                user.set("email", email);

                //Extra preperties
                user.set("firstName", firstName);
                user.set("lastName", lastName);
                user.set("groups", groups); //array
                // user.set("phone", "415-392-0202");


                var deferred = $q.defer();

                //do the signup using the parse api
                user.signUp(null, {
                    success: function (data) {
                        // Hooray! Let them use the app now.
                        _log("Signedup User:" + JSON.stringify(data));
                        var user = JSON.parse(JSON.stringify(data));
                        _toast("Hello " + user.firstName + " " + user.lastName);

                        return deferred.resolve(user);

                    },
                    error: function (user, error) {
                        // Show the error message somewhere and let the user try again.
                        //                    _toast("Error: " + error.code + " : " + JSON.stringify(error));
                        _toast(JSON.stringify(error));
                        return deferred.reject(user);
                    }
                });
                return deferred.promise;
            };

            var _updateUsername = function (username, installationId) {

                Parse.Cloud.run('updateUsername', {
                    "username": username,
                    "installationId": installationId
                }, {
                    success: function (result) {
                        _log(JSON.stringify(result));
                    },
                    error: function (error) {
                        _log(JSON.stringify(error));
                    }
                });

            };

            var _registerCallback = function () {
                /////
                parsePlugin.registerCallback('onNotification', function () {
                    window.onNotification = function (pnObj) {
                        _pushReceived(pnObj);
                        if (pnObj.receivedInForeground === false) {
                            // TODO: route the user to the uri in pnObj

                        }
                    };
                }, function (error) {
                    console.error("Callback Registration failed.");
                    console.error(error);
                });
            };
            var _sendPush = function (push) {

                Parse.Cloud.run('sendPush', push, {
                    success: function (result) {
                        _log(JSON.stringify(result));
                    },
                    error: function (error) {
                        _log(JSON.stringify(error));
                    }
                });
            };
            var settings = {
                "direction": "left",
                "speed": "fast",
                "vibrationPattern": [1000, 100, 2],
                "soundEnabled": true,
                "vibrationEnabled": true,
                "delayTime": 200
            };

            var _pushReceived = function (pushObj) {
                pushObj.timeReceived = Date.now();
                _log("Push received : " + JSON.stringify(pushObj));

                NotifyService.notify(pushObj);
            };



            var _toast = function (text) {
                try {
                    NotifyService.toast(text);
                } catch (e) {
                    _log(text);
                }
            };
            var _log = function (text) {
                console.log("ParseService: " + text);
            };
            return {
                appId: _appId,
                clientKey: _clientKey,
                getContacts: _getContacts,
                getChannels: _getChannels,
                getCurrentUser: _getCurrentUser,
                init: _init,
                login: _login,
                logout: _logout,
                restAPIKey: _restAPIKey,
                refreshContactsList: _refreshContactsList,
                registerCallback: _registerCallback,
                signUp: _signUp,
                sendPush: _sendPush,
                updateUsername: _updateUsername,

            };
        }]);