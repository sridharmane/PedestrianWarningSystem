angular.module('PedestrianWarningSystem.services', []).factory("Contacts", function () {
        var Contacts = {};

        Contacts.list = [];
        Contacts.channels = [];
        Contacts.contactsLastRefreshed = null;
        Contacts.channelsLastRefreshed = null;
        Contacts.addContact = function (contact) {
//            console.log(JSON.stringify(contact));
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
            'keepAwake': true, //Device never sleeps if this is enabled

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
    .service('NotifyService', ['SettingsService', '$cordovaToast', '$cordovaMedia', '$cordovaVibration',
    function (SettingsService, $cordovaToast, $cordovaMedia, $cordovaVibration) {
            var _lastPush = {
                timeDifference: 1234,
                timeSinceReceived: 0,

                notificationPlayed: false,
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

            var _vibrate = function (pattern) {
                $cordovaVibration.vibrate(pattern);
                _log("Vibrating with pattern:" + pattern + " ");
            };

            var _playSound = function (notification) {
                var audioSrc = "/android_asset/www/";
                if (notification.carDirection === "left")
                    audioSrc += SettingsService.settings.audioSrc.left;
                else if (notification.carDirection === "right")
                    audioSrc += SettingsService.settings.audioSrc.right;

                _log("Setting source to :" + audioSrc);

                //Check if  Media Plugin is available. If available, use it to notify.
                if ($cordovaMedia) {
                    var media = $cordovaMedia.newMedia(audioSrc);
                    //                    .then(function () {
                    //                        _toast("Media Initalised, playing");
                    //                    }, function () {
                    //                        _toast("Media Load Error");
                    //                    });

                    media.play();
                } else { //Fallback to html5 audio
                    _log("Using HTML5 Audio");
                    var audio = document.getElementById("audio");
                    audio.src = audioSrc;
                    audio.play();
                }
                _log("Played Sound");
            };

            var _saveLastPush = function (push) {
                //save time difference
                push.timeDifference = _getTimeDiff(push.timeReceived, push.timeSent);
                //Check if push was received later than set delay time
                if (push.timeDifference > push.delayTime)
                    push.delayTimeExceeded = true;
                else
                    push.delayTimeExceeded = false;
                //save the push
                _lastPush = push;
            };

            var _notify = function (push) {
                //First Save the notification
                _saveLastPush(push);
                var settings = push.settings;
                var notification = push.notification;
                if (!push.delayTimeExceeded) {
                    _log("Notifying User");
                    if (settings.soundEnabled) {
                        _playSound(notification);
                    }
                    if (settings.vibrationEnabled) {
                        _vibrate(settings.vibrationPattern);
                    }
                    _lastPush.notificationPlayed = true;
                    _toast("Received Push: \t Playing Notification");
                } else {
                    _toast("Received Push: \t Time Limit Exceeded, No notification");
                }

            };

            var _secondsToHMS = function (secs) {
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
                _log("Time Difference: " + diffMilliseconds);
                //                return _secondsToHMS(diffSeconds);
                return diffMilliseconds;
            };
            return {
                toast: _toast,
                notify: _notify,
                lastPush: _lastPush,
                getLastPush: _getLastPush,
            };

    }])
    .service('KeepAwakeService', ['SettingsService', '$cordovaToast', function (SettingsService, $cordovaToast) {
        var _keepAwake = function () {
            window.plugins.insomnia.keepAwake();
            _toast("On");
        };
        var _allowSleepAgain = function () {
            window.plugins.insomnia.allowSleepAgain();
            _toast("Off");
        };
        var _toggleKeepAwake = function () {
            if (SettingsService.settings.keepAwake) {
                _keepAwake();
            } else {
                _allowSleepAgain();
            }
        };
        var _toast = function (text) {
            try {
                $cordovaToast.showLongBottom("KeepAwakeService: " + text);
                _log(text);
            } catch (e) {
                _log(text);
            }
        };
        var _log = function (text) {
            console.log("KeepAwakeService: " + text);
        };
        return {
            toggleKeepAwake: _toggleKeepAwake
        };
}])
    .service('BackgroundService', ['$cordovaToast',
    function ($cordovaToast) {
            var backgroundModeSettings = {
                silent: true,
            };
            var _enable = function () {
                if (cordova.plugins.backgroundMode) {
                    cordova.plugins.backgroundMode.configure(backgroundModeSettings);
                    cordova.plugins.backgroundMode.enable();
                    if (_isEnabled)
                        _toast("BackgroundService Enabled");
                } else {
                    _toast("BackgroundService Not Available");
                }
            };
            var _disable = function () {
                if (cordova.plugins.backgroundMode) {
                    cordova.plugins.backgroundMode.disable();
                    if (!_isEnabled)
                        _toast("BackgroundService Disabled");
                } else {
                    _toast("BackgroundService Not Available");
                }
            };
            var _isEnabled = function () {
                return cordova.plugins.backgroundMode.isEnabled();
            };

            var _toggleBackgroundMode = function () {
                cordova.plugins.backgroundMode.onfailure = function (errorCode) {
                    _toast("Error in BG Mode :" + errorCode);
                };
                if (_isEnabled()) {
                    _disable();
                } else {
                    _enable();
                }
            };
            var _onFailure = function () {

            };
            var _toast = function (text) {
                try {
                    $cordovaToast.showLongBottom(text);
                    _log(text);
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
    .service('ParseService', ['$q', 'Contacts', 'SettingsService', 'NotifyService', '$localstorage',
    function ($q, Contacts, SettingsService, NotifyService, $localstorage) {
            /**
             *   Variables and constants
             */
            var _appId = "xT5AKbQJvofdDgjUBzJhFPgTeuPZ97ux854Biy31";
            var _clientKey = "PsNI6F4VeSO0m2yaHLn6uYnoaN8X7sbUJ7nOj1wE";
            var _jsKey = "YNFW7qk1gKUIxE2RiOGJFKIPyGtdorus8E1mPCyr";
            var _restAPIKey = "gJwHkPD7RtIrF1kqLyg1rqbtvcRKeitNijAKXcAg";
            var _installationId = '';
            /**
             *   Functions
             */

            var _init = function () {
                var defer = $q.defer();
                Parse.initialize(_appId, _jsKey);
                parsePlugin.initialize(_appId, _clientKey, function () {
                    //Get the installation objectId and save it
                    parsePlugin.getInstallationId(function (id) {
                        _saveInstallationId(id);
                        defer.resolve(id);
                        //defer.resolve("Setup Success. Device registered to receive notifications.");

                    }, function (error) {
                        defer.reject('Error getting installation object id. ' + error);
                    });
                }, function (error) {
                    defer.reject('Error initializing. Cannot send targeted notifications. Please Try Again !' + error);
                });

                return defer.promise;
            };

            /*
                Retruns the installationId
                if not found, will call setup
            */
            var _getInstallationId = function () {
                var defer = $q.defer();
                if (_installationId === '') {
                    if ($localstorage.get('installationId', '') === '') {
                        _log('No Installaiton ID found, attempting to retreive one');
                        _init().then(function (installationId) {
                            _saveInstallationId(installationId);
                            defer.resolve(installationId);
                        }, function (err) {
                            defer.reject(err);
                            _toast(err);
                        });
                    } else {
                        _log("Found installationId @localstorage");
                        defer.resolve($localstorage.get('installationId', ''));
                    }
                } else {
                    _log("Found installationId @Service");
                    defer.resolve(_installationId);
                }
                return defer.promise;
            };

            var _saveInstallationId = function (id) {
                _installationId = id;
                $localstorage.set('installationId', id);
            };

            var _refreshContactsList = function () {
                var query = new Parse.Query(Parse.User);
                query.find({
                    success: function (contacts) {
                        var contactsJson = JSON.parse(JSON.stringify(contacts));
                        var contactsList = [];
                        for (var i = 0; i < contactsJson.length; i++) {
                            contactsList.push(contactsJson[i]);
                        }
                        console.log(contactsList);
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

                var defer = $q.defer();

                Parse.User.logIn(username, password, {
                    success: function (user) {
                        defer.resolve(JSON.parse(JSON.stringify(user)));
                    },
                    error: function (user,error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;

            };
            var _logout = function () {
                if (_getCurrentUser())
                    _log("Loging out current user with username:" + JSON.stringify(_getCurrentUser()));
                else
                    _log("No user to logout " + JSON.stringify(_getCurrentUser()));
                Parse.User.logOut();
            };
            var _signUp = function (username, password, email, name) {
                //                var _signUp = function (username, password, firstName, lastName, groups) {

                //Logout current user
                Parse.User.logOut();

                var defer = $q.defer();
                
                //Creating new User
                var user = new Parse.User();
                //Min required for using Parse signup feature
                user.set("username", username);
                user.set("password", password);
                user.set("email", email);

                //Extra preperties
                user.set("name", name);
//                user.set("groups", groups); //array
                // user.set("phone", "415-392-0202");


                //do the signup using the parse api
                user.signUp(null, {
                    success: function (data) {
                        // Hooray! Let them use the app now.
                        var user = JSON.parse(JSON.stringify(data));
                        defer.resolve(user);
                    },
                    error: function (user,error) {
                        defer.reject(error.message);
                    }
                });
                return defer.promise;
            };

            var _updateUser = function () {
                var defer = $q.defer();
                var currentUserId = Parse.User.current().id;
                var installationId = _installationId;
                //Check if installationId is available, if not, init
                if (installationId === '') {
                    _getInstallationId().then(function (id) {
                        installationId = id;
                    }, function (error) {
                        _log("Couldnot get installation Id. Error: " + error);
                    });
                }
                //Update the user using cloud code since the js sdk cannot update the installation object.
                //Will change to REST API later.
                Parse.Cloud.run('updateUser', {
                    "userId": currentUserId,
                    "installationId": installationId
                }, {
                    success: function (result) {
                        defer.resolve(result);
                    },
                    error: function (error) {
                        defer.reject(error);
                    }
                });
                return defer.promise;
            };

            var _registerCallback = function () {

                parsePlugin.registerCallback('onNotification', function () {
                    window.onNotification = function (pnObj) {
                        console.log("_registerCallback: triggered, handling received push");
                        _pushReceived(pnObj);
                        if (pnObj.receivedInForeground === false) {
                            // TODO: route the user to the uri in pnObj
                            console.log("_registerCallback: received in background");
                        } else {
                            console.log("_registerCallback: received in foreground");
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
                "delayTime": 2,
                "keepAwake": true
            };

            var _pushReceived = function (pushObj) {
                pushObj.timeReceived = Date.now();
                pushObj.notificationPlayed = false;
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
                updateUser: _updateUser,
                getInstallationId: _getInstallationId,
            };
        }])


//NOTE: We are including the constant `ApiEndpoint` to be used here.
.factory('Api', function ($http, ApiEndpoint) {
    console.log('ApiEndpoint', ApiEndpoint);

    var getApiData = function () {
        return $http.get(ApiEndpoint.url + '/tasks')
            .then(function (data) {
                console.log('Got some data: ', data);
                return data;
            });
    };

    return {
        getApiData: getApiData
    };
});