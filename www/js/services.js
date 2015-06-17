angular.module('PreWarning.services', []).factory("Contacts", function () {
    var Contacts = {};

    Contacts.list = [];
    Contacts.lastRefreshed = "Never";
    Contacts.add = function (contact) {
        Contacts.list.push(contact);
        Contacts.lastRefreshed = Date.now();
    };
    Contacts.updateList = function (contacts) {
        Contacts.list = contacts;
        Contacts.lastRefreshed = Date.now();
    };
    Contacts.clear = function () {
        Contacts.list = [];
    };

    return Contacts;
})

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
        settings.vibrationDuration = pattern[0];
        settings.vibrationDelay = pattern[1];
        settings.vibrationRepeat = pattern[2];
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

.service('ParseService', ['$sce', '$q', 'Contacts', 'SettingsService', '$cordovaToast',
    function ($sce, $q, Contacts, SettingsService, $cordovaToast) {
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
                    Contacts.updateList(contacts);
                }
            });
        };

        var _refreshContacts = function (params) {
            var ContactsObj = Parse.Object.extend("Contacts");
            var query = new Parse.Query(ContactsObj);

            if (params !== undefined) {
                if (params.lastname !== undefined) {
                    query.equalTo("lastName", params.lastName);
                }
                if (params.firstname !== undefined) {
                    query.equalTo("firstName", params.firstName);
                }
            }

            query.find({
                success: function (results) {

                    console.log("Successfully retrieved " + results.length + " people!");
                    // Clear Contacts first
                    Contacts.clear();
                    //Populate Contacts
                    for (var i = 0; i < results.length; i++) {
                        Contacts.add(results[i]);
                        console.log(JSON.stringify(results[i]));
                    }

                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };

        var _getContacts = function () {
            if (Contacts.lastRefreshed === "Never")
                _refreshContacts();

            console.log("Get Contacts: " + JSON.stringify(Contacts.list));
            return Contacts.list;
        };

        var _getCurrentUser = function () {

            var currentUser = Parse.User.current();
            if (currentUser) {
                return currentUser;
            } else {
                return {};
            }
        };


        var _login = function (username, password) {
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
        var _signUp = function (username, password, firstName, lastName, email, groups) {

            //Logout Old User
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
                success: function (user) {
                    // Hooray! Let them use the app now.
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

        var x = {
            "direction": "left",
            "speed": "fast",
            "vibrationPattern": [1000, 100, 2],
            "soundEnabled": true,
            "vibrationEnabled": true,
            "delayTime": 200
        };

        var _pushReceived = function (pushObj) {
            console.log("Push received : changing settings");
            var settings = SettingsService.settings;
            //Update Settings
            SettingsService.setVibrationStatus(pushObj.vibrationEnabled);
            SettingsService.setVibrationPattern(pushObj.vibrationPattern);
            SettingsService.setSoundStatus(pushObj.soundEnabled);
            SettingsService.setDelayTime(pushObj.delayTime);
            
            //TODO Make background service and notify using it.
            
        };



        var _toast = function (text) {
            try {
                $cordovaToast.showLongBottom(text);
            } catch (e) {
                _log(text);
            }
        };
        var _log = function (text) {
            console.log(text);
        };
        return {
            appId: _appId,
            clientKey: _clientKey,
            restAPIKey: _restAPIKey,
            login: _login,
            signUp: _signUp,
            refreshContactsList: _refreshContactsList,
            
            registerCallback:_registerCallback,

            init: _init,
            getCurrentUser: _getCurrentUser,
        };
        }]);