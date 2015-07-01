angular.module('PreWarning.controllers', [])
    .controller('AccountCtrl', ['$scope', 'ParseService', '$ionicModal', '$localstorage', function ($scope, ParseService, $ionicModal, $localstorage) {
        $scope.loginData = {
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
            groups: [],
            pass: '',
            channel1: false,
            channel2: false,
            channel3: false,
        };
        $scope.currentUser = "";
        $scope.saveCurrentUser = function (user) {
            console.log("Saving user with username:" + user.username);
            $scope.currentUser = user;
            $localstorage.setObject('currentUser', user);
        };
        $scope.getCurrentUser = function () {
            if ($scope.currentUser.username) {
                console.log("CurrentUser already present");
            } else {
                if ($localstorage.getObject('currentUser')) {
                    $scope.currentUser = $localstorage.getObject('currentUser');
                    console.log("Current User: " + $scope.currentUser.username);
                } else {
                    console.log("No user found in loca storage, checking parse server.");
                    var currentUser = ParseService.getCurrentUser();
                    if (currentUser) {
                        console.log("User found on Parse server.");
                        console.log(JSON.stringify(currentUser));
                        $scope.saveCurrentUser(currentUser);
                    } else {
                        console.log("No user found in loca storage, Login.");
                        $scope.login();
                    }
                }
            }
        };

        //Login Modal
        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            $scope.modalLogin = modal;
        });
        $scope.login = function () {
            $scope.modalLogin.show();
        };
        $scope.logout = function () {
            ParseService.logout();
            $localstorage.set("currentUser", "");
            $scope.currentUser = "";
        };
        $scope.hideLogin = function () {
            $scope.modalLogin.hide();
        };
        $scope.doLogin = function () {
            var promise = ParseService.login($scope.loginData.username, $scope.loginData.password)
                .then(function (user) {
                    if (user) {
                        console.log("doLogin: Returned from Parse: " + JSON.stringify(user));
                        user = JSON.parse(JSON.stringify(user));
                        $scope.saveCurrentUser(user);
                        ParseService.updateUsername(user.username, $localstorage.get('installationId', ''));
                        $scope.hideLogin();
                    }
                }, function (error) {
                    // promise rejected, could log the error with: console.log('error', error);
                    console.log(error);
                });
        };

        //Sign Up Modal
        $ionicModal.fromTemplateUrl('templates/sign-up.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            $scope.modalSignUp = modal;
        });
        $scope.signUp = function () {
            $scope.modalSignUp.show();
        };
        $scope.hideSignUp = function () {
            $scope.modalSignUp.hide();
        };
        $scope.doSignUp = function () {
            //params username, password, firstName, lastName, email, groups
            var promise = ParseService.signUp($scope.loginData.username,
                    $scope.loginData.password,
                    $scope.loginData.firstName,
                    $scope.loginData.lastName,
                    $scope.loginData.email,
                    $scope.loginData.groups)
                .then(function (user) {
                    if (user.username) {
                        $scope.saveCurrentUser(user);
                        $scope.hideSignUp();
                        //Update the username corresponding to the installation.
                        ParseService.updateUsername(user.username, $localstorage.get('installationId', ''));
                    }
                }, function (error) {
                    // promise rejected, could log the error with: console.log('error', error);
                    console.log(error);
                });
        };

}])

.controller('ReceiveCtrl', ['$scope', 'SettingsService', 'NotifyService', function ($scope, SettingsService, NotifyService) {

    $scope.settings = SettingsService.settings;
    $scope.lastPush =NotifyService.lastPush;
    $scope.getLastPush = function(){
        $scope.lastPush = NotifyService.getLastPush();
        console.log("lastPush: "+JSON.stringify($scope.lastPush));
    };
}])

.controller('SendCtrl', ['$scope', 'ParseService', 'SettingsService', 'Contacts', '$cordovaNetwork', '$cordovaToast', '$http', '$sce', '$ionicModal', function ($scope, ParseService, SettingsService, Contacts, $cordovaNetwork, $cordovaToast, $http, $sce, $ionicModal) {

    $scope.settings = SettingsService.settings;
    $scope.lastRefreshed = Contacts.lastRefreshed;
    var baseUrl = "https://api.parse.com/1/";
    var pushUrl = "push";

    $scope.contacts = [];
    $scope.channels = [];
    $scope.selected = {
        contact: {},
        channel: {},
    };

    $ionicModal.fromTemplateUrl('templates/contacts-list.html', {
        scope: $scope,
        animation: 'slide-in-up',
        //        controller: 'SendCtrl'
    }).then(function (modal) {
        $scope.getContacts();
        $scope.getChannels();
        $scope.modalContacts = modal;
    });
    $scope.showContacts = function () {
        $scope.getContacts();
        $scope.getChannels();
        $scope.modalContacts.show();
        if (Contacts.lastRefreshed === "Never")
            ParseService.refreshContactsList();
    };
    $scope.hideContacts = function () {
        $scope.modalContacts.hide();
    };

    $scope.selectContact = function (contact) {
        $scope.selected.contact = contact;
        $scope.hideContacts();
    };
    $scope.selectChannel = function (channel) {
        $scope.selected.channel = channel;
        $scope.hideContacts();
    };
    $scope.clearSelectedChannel = function () {
        $scope.selected.channel = {};
    };
    $scope.clearSelectedContact = function () {
        console.log("Clearing Contact");
        $scope.selected.contact = {};
        console.log($scope.selected.contact);
    };


    $scope.getContacts = function () {
        if ($scope.contacts.length > 0) {} else {
            $scope.contacts = ParseService.getContacts();
        }
    };
    $scope.getChannels = function () {
        if ($scope.channels.length > 0) {} else {
            $scope.channels = ParseService.getChannels();
        }
    };
    $scope.getContactsLastRefreshed = function () {
        return Contacts.contactsLastRefreshed;
    };
    $scope.getChannelsLastRefreshed = function () {
        return Contacts.channelsLastRefreshed;
    };


    /****************Temp*/
    var notifyUser = function (direction) {
        if ($scope.settings.soundEnabled)
            playSound(direction);
        if ($scope.settings.vibrationEnabled)
            vibrateWithPattern();
    };

    var vibrate = function (pattern) {
        navigator.vibrate(pattern);
    };
    var vibrateWithPattern = function () {
        var pattern = [];
        for (var i = 0; i < $scope.settings.vibrationRepeat; i++) {
            pattern.push($scope.settings.vibrationDuration);
            if (i != i - 1)
                pattern.push($scope.settings.vibrationDelay);
        }
        vibrate(pattern);
    };
    var playSound = function (direction) {
        var audio = document.getElementById("audio");
        if (direction === "left") {
            audio.src = $scope.settings.audioSrc.left;
        } else if (direction === "right") {
            audio.src = $scope.settings.audioSrc.right;
        }
        audio.play();
    };

    /**
        Returns a push object with
    */

    var _buildPush = function () {

        /*
        Build Vibration Pattern
        [NumberOfTimesToRepeat,DurationOfEachVibration,DelayBetweenVibrations]
        */
        var vibrationPattern = [$scope.settings.vibrationRepeat, $scope.settings.vibrationDuration, $scope.settings.vibrationDelay];

        var push = {};

        if ($scope.selected.channel) {
            push.channel = $scope.selected.channel;
        } else {
            push.channel = "";
        }
        if ($scope.selected.contact) {

            push.contact = {
                "username": $scope.selected.contact.username
            };
        } else {
            push.contact = "";
        }
        push.notification = {
            "carSpeed": $scope.carSpeed,
            "carDirection": $scope.carDirection,
        };
        push.settings = {
            "delayTime": $scope.settings.delayTime,
            "soundEnabled": $scope.settings.soundEnabled,
            "vibrationEnabled": $scope.settings.vibrationEnabled,
            "vibrationPattern": vibrationPattern
        };
        push.timeSent = Date.now();
        console.log("push sent at:" +push.timeSent);
        return push;
    };

    $scope.sendPush = function () {
        var push = _buildPush();
        console.log("Pusing to:" + push.contact.username + " channel:'" + push.channel + "'");
        ParseService.sendPush(push);
    };
    $scope.savePerson = function (fname, lname) {
        ParseService.savePerson(fname, lname);
    };
    $scope.getPeople = function (params) {
        ParseService.getPeople(params);
    };

    $scope.setSpeed = function (speed) {
        $scope.carSpeed = speed;
        console.log($scope.carSpeed);
    };
    $scope.isSpeedBtnActive = function (type) {
        return type === $scope.carSpeed;
    };
    $scope.setDirection = function (direction) {
        $scope.carDirection = direction;
        console.log($scope.carDirection);
    };
    $scope.isDirectionBtnActive = function (type) {
        return type === $scope.carDirection;
    };

    $scope.clearSelection = function () {
        $scope.settings.carSpeed = "";
        $scope.settings.carDirection = "";
    };
}])


.controller('SettingsCtrl', ['$scope', 'SettingsService', 'BackgroundService', function ($scope, SettingsService, BackgroundService) {
    $scope.settings = SettingsService.settings;

    $scope.toggleBackgroundMode = function () {
        BackgroundService.toggleBackgroundMode();
    };
    //    $scope.settings.smsDelayTime = 0.5;
    }]);