angular.module('PreWarning.controllers', [])


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

    $scope.toggleSmsListener = function () {

        if ($scope.settings.smsListenerOn) {
            if (SMS) SMS.startWatch(success('Watch Start'), error('startWatch Error'));
            if (SMS) SMS.enableIntercept(true, success('Intercept Start'), error('Intercept error'));
        } else {
            if (SMS) SMS.stopWatch(success('Watch End'), error('stopWatch Error'));
            if (SMS) SMS.enableIntercept(false, success('Intercept Stop'), error('Intercept error'));
        }
    };

    document.addEventListener('onSMSArrive', function (event) {
        try {
            console.log(event.data);
            smsArrived(event.data);
        } catch (err) {
            console.log(err.name);
            console.log(err.message);
        }

    });

    var smsArrived = function (sms) {

        $scope.sms = sms;
        $scope.sms.timeDifference = getTimeDiff(sms.date_sent);
        $scope.sms.default = false;


        //        $scope.$apply(function () {
        //            $scope.smsList.push(sms);
        //        });
        //        console.log($scope.smsList);
        //        SMS.listSMS($scope.settings.filter, function (data) {
        //            console.log(data);
        //            if (data.constructor === Array) {
        //                for ( var i=0;i < data.length;i++) {
        //                    var sms = data[i];
        //                    sms.timeDifference = getTimeDiff(sms.date_sent);
        //                    $scope.smsList.push(sms);
        //                }
        //            }

        //        }, function (err) {
        //            console.log('Error' + err);
        //        });

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

.controller('SendCtrl', ['$scope', 'ContactsService', 'SettingsService', '$rootScope', '$cordovaNetwork', '$cordovaToast', function ($scope, ContactsService, SettingsService, $rootScope, $cordovaNetwork, $cordovaToast) {

    $scope.settings = SettingsService.settings;



    //Set SelectedContact to none
    $scope.selectedContact = {
        name: "Sridhar Mane",
        phone: "7165985933",
        photo: "content://com.android.contacts/contacts/5285/photo"
    };

    //    setTimeout(function(){
    //        $scope.getNetworkState();
    //    },3000);

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
        }
        /***/



    $scope.sendNotification = function () {
        if (SMS) SMS.setOptions({
            license: "sridharmane@gmail.com/e1e2c8dcadd8b4ddafdcd1d43b456f47"
        });
        console.log("car SPeed :" + $scope.carSpeed + ":");
        var notifcationString = buildNotification();
        if (SMS) SMS.sendSMS($scope.selectedContact.phone, notifcationString, smsSuccess, smsFail);
        $scope.clearSelection();
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


    $scope.pickPhoneContact = function () {
        console.log('This works');

        console.log(ContactsService);
        ContactsService.pickContact().then(
            function (contact) {
                $scope.selectContact(contact);
            },
            function (failure) {
                console.log("Failed to pick a contact");
            }
        );

    };
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

.controller('SettingsCtrl', ['$scope', 'SettingsService', function ($scope, SettingsService) {
    $scope.settings = SettingsService.settings;
    //    $scope.settings.smsDelayTime = 0.5;
    }]);