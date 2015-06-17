angular.module('PreWarning.controllers', [])
    .controller('StartCtrl', ['$scope', 'ParseService', '$ionicModal', function ($scope, ParseService, $ionicModal) {
        $scope.loginData = {
            username: '',
            password: '',
            firstName: '',
            lastName: '',
            email: '',
            groups: [],
            pass: ''
        };
        $scope.currentUser = function(){ 
            return ParseService.getCurrentUser();
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
        $scope.hideLogin = function () {
            $scope.modalLogin.hide();
        };
        $scope.doLogin = function () {
            var promise = ParseService.login($scope.loginData.username, $scope.loginData.password)
            .then(function (user) {
                if (user) {
                    console.log(user);
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
                    if (user) {
                        console.log(user);
                        $scope.hideSignUp();
                    }
                }, function (error) {
                    // promise rejected, could log the error with: console.log('error', error);
                    console.log(error);
                });
        };

}])

.controller('ReceiveCtrl', ['$scope', 'SettingsService', function ($scope, SettingsService) {

    $scope.settings = SettingsService.settings;
    $scope.sms = {
        address: "+17163352691",
        body: {
            "cs": "fast",
            "cd": "left",
            "sdt": 2000,
            "vp": [2, 1000, 100]
        },
        date: 1428524327110,
        date_sent: 1428524338000,
        read: 0,
        seen: 0,
        service_center: "+12404492164",
        status: 0,
        timeDifference: "10 seconds",
        type: 1,
        default: false
    };




    var getTimeDiff = function (timestamp) {

        var difference = new Date().getTime() - new Date(timestamp).getTime();

        var secondsDiff = Math.floor(difference / 1000);

        return secondsDiff + " seconds";
    };

    var success = function (msg) {
        console.log(msg);
    };

    var error = function (error) {
        console.log(error);
    };

    var notifyUser = function (direction) {
        if ($scope.settings.soundEnabled)
            playSound(direction);
        if ($scope.settings.vibrationEnabled)
            vibrateWithPattern();
    };

    var vibrate = function (time) {
        navigator.vibrate(time);
    };
    var vibrateWithPattern = function () {
        for (var i = 0; i < $scope.settings.vibrationRepeat; i++) {
            setInterval(vibrate($scope.settings.vibrationDuration), $scope.settings.vibrationDelay);
        }
    };
    var playSound = function (direction) {
        var audio = document.getElementById("audio");
        if (direction == "left")
            $scope.currentAudioSrc($scope.settings.audioSrc.left);
        else if (direction == "right")
            $scope.currentAudioSrc($scope.settings.audioSrc.right);
        audio.play();
    };

}])

.controller('SendCtrl', ['$scope', 'ParseService', 'SettingsService', 'Contacts', '$cordovaNetwork', '$cordovaToast', '$http', '$sce', '$ionicModal', function ($scope, ParseService, SettingsService, Contacts, $cordovaNetwork, $cordovaToast, $http, $sce, $ionicModal) {

    $scope.settings = SettingsService.settings;
    $scope.contacts = Contacts.list;
    $scope.lastRefreshed = Contacts.lastRefreshed;

    $ionicModal.fromTemplateUrl('templates/contacts-list.html', {
        scope: $scope,
        animation: 'slide-in-up',
        //        controller: 'SendCtrl'
    }).then(function (modal) {
        $scope.modalContacts = modal;
    });
    $scope.showContacts = function () {
        $scope.modalContacts.show();
        if (Contacts.lastRefreshed === "Never")
            ParseService.refreshContactsList();
    };
    $scope.hideContacts = function () {
        $scope.modalContacts.hide();
    };


    //Set SelectedContact to none
    $scope.selectedContact = {
        id: ""
    };

    $scope.selectContact = function (contact) {

        $scope.selectedContact.name = contact.displayName;
        $scope.selectedContact.phone = contact.phones[0].value;

        $scope.selectedContact.photo = contact.photos[0].value;
        console.log($scope.selectedContact);

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
    /***/



    $scope.sendNotification = function () {
        //        if (SMS) SMS.setOptions({
        //            license: "sridharmane@gmail.com/e1e2c8dcadd8b4ddafdcd1d43b456f47"
        //        });
        //        console.log("car SPeed :" + $scope.carSpeed + ":");
        //        var notifcationString = buildNotification();
        //        if (SMS) SMS.sendSMS($scope.selectedContact.phone, notifcationString, smsSuccess, smsFail);

        //                ContactsService.createContact("Sridhar","Mane");
        //        ParseService.getAll();        $scope.clearSelection();
    };
    $scope.savePerson = function (fname, lname) {
        ParseService.savePerson(fname, lname);
    };
    $scope.getPeople = function (params) {
        ParseService.getPeople(params);
    };

    var buildNotification = function () {
        var vibrationPattern = [$scope.settings.vibrationRepeat,
                                $scope.settings.vibrationDuration,
                               $scope.settings.vibrationDelay,
                               ];
        var notification = {
            "cs": $scope.carSpeed,
            "cd": $scope.carDirection,
            "sdt": $scope.settings.smsDelayTime,
            "vp": vibrationPattern
        };
        console.log(JSON.stringify(notification) + "-len: " + JSON.stringify(notification).length);
        //        return notification;
        //        return "looks like this works";
        return "Hi";
    };

    var smsSuccess = function () {
        console.log("Notification Sent");
        $cordovaToast.showLongCenter("Notification Sent");
    };
    var smsFail = function () {
        console.log("Notification Failed");
        $cordovaToast.showLongCenter("Notification Failed !!");
    };
    //     window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fs){
    //            fs.root.getFile("temp.jpg", {create: true, exclusive: false},
    //              function(entry){
    //                var fileTransfer = new FileTransfer();
    //                fileTransfer.download(
    //                        fileName, // the filesystem uri you mentioned
    //                        entry.toURL(),
    //                        function(entry) {
    //                            // do what you want with the entry here
    //                            console.log("download complete: " + entry.fullPath);
    //                            var src = entry.toURL(); 
    //                            $("div[role=main]").append('<img src="'+src+'" >');
    //                        },
    //                        function(error) {
    //                            console.log("error source " + error.source);
    //                            console.log("error target " + error.target);
    //                            console.log("error code " + error.code);
    //                            console.log(error);
    //                        },
    //                        false,
    //                        null
    //                );
    //            }, function(e){
    //                console.log("file create error",e);
    //            });
    //        }, null);



    //    $scope.isOnline = $cordovaNetwork.isOnline();
    //  // listen for Online event1
    //     document.addEventListener('$cordovaNetwork:online', function(event, networkState){
    //      $scope.$apply(function(){
    //        $scope.onlineState = networkState;
    //      });
    //    });
    //
    //    // listen for Offline event
    //     document.addEventListener('$cordovaNetwork:offline', function(event, networkState){
    //      $scope.$apply(function(){
    //        $scope.offlineState = networkState;
    //      });
    //    });



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


.controller('SettingsCtrl', ['$scope', 'SettingsService', 'ParseService', 'Contacts', function ($scope, SettingsService, ParseService, Contacts) {
    $scope.settings = SettingsService.settings;
    $scope.lastRefreshed = Contacts.lastRefreshed;
    $scope.refreshContactsList = function () {
        ParseService.refreshContactsList();
    };
    //    $scope.settings.smsDelayTime = 0.5;
    }]);