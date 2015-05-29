angular.module('warningApp.controllers', [])

.controller('ReceiveCtrl', ['$scope', 'SettingsService', function ($scope, SettingsService) {

    $scope.settings = SettingsService.settings;
    $scope.smsList = [
        {
            address: "+17163352691",
            body: "Hi",
            date: 1428524327110,
            date_sent: 1428524338000,
            read: 0,
            seen: 0,
            service_center: "+12404492164",
            status: 0,
            timeDifference: "0 hrs : 0 mins : 10 sec",
            type: 1
        }
    ];
    //    $scope.smsList =[];

    $scope.toggleSmsListener = function () {

        // We togle the SMS Listener & SMS Intercepter h-ere

        if ($scope.settings.smsListenerOn) {
            SMS.startWatch(success('Watch Start'), error('startWatch Error'));
            SMS.enableIntercept(true, success('Intercept Start'), error('Intercept error'));
        } else {
            SMS.stopWatch(success('Watch End'), error('stopWatch Error'));
            SMS.enableIntercept(false, success('Intercept Stop'), error('Intercept error'));
        }
    };

    document.addEventListener('onSMSArrive', function (event) {

        var sms = event.data;
        sms.timeDifference = getTimeDiff(sms.date_sent);
        $scope.$apply(function () {
            $scope.smsList.push(sms);
        });
        console.log($scope.smsList);
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

    });

    var showSMS = function (SMS) {

    };

    var getTimeDiff = function (timestamp) {

        var difference = new Date().getTime() - new Date(timestamp).getTime();

        var daysDiff = Math.floor(difference / 1000 / 60 / 60 / 24);
        difference -= daysDiff * 1000 * 60 * 60 * 24;

        var hoursDiff = Math.floor(difference / 1000 / 60 / 60);
        difference -= hoursDiff * 1000 * 60 * 60;

        var minutesDiff = Math.floor(difference / 1000 / 60);
        difference -= minutesDiff * 1000 * 60;

        var secondsDiff = Math.floor(difference / 1000);


        return hoursDiff + " hrs : " + minutesDiff + " min : " + secondsDiff + " sec";
    };

    var success = function (msg) {
        console.log(msg);
    };

    var error = function (error) {
        console.log(error);
    };

}])

.controller('SendCtrl', ['$scope', 'ContactsService', 'SettingsService', '$rootScope', '$cordovaNetwork', function ($scope, ContactsService, SettingsService, $rootScope, $cordovaNetwork) {

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


    $scope.sendSMS = function () {  
        if (!$scope.settings.isOffline)
            SMS.sendSMS($scope.selectedContact.phone, "Hi", smsSuccess, smsFail);
        else
            console.log("isOffline Cant send Message");
    };

    var smsSuccess = function () {
        console.log("Sent");
    };
    var smsFail = function () {
        console.log("Sent");
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

}])

.controller('SpeedBtnCtrl', function ($scope) {
        $scope.speed = 'slow';
        $scope.setSpeed = function (type) {
            $scope.speed = type;
        };
        $scope.isActive = function (type) {
            return type === $scope.speed;
        };
    })
    .controller('DirectionBtnCtrl', function ($scope) {
        $scope.direction = 'left';
        $scope.setDirection = function (type) {
            $scope.direction = type;
        };
        $scope.isActive = function (type) {
            return type === $scope.direction;
        };
    })
    .controller('SettingsCtrl', function ($scope, $window, $timeout, SettingsService) {
        $scope.settings = SettingsService.settings;
        //    $scope.settings.smsDelayTime = 0.5;



    });