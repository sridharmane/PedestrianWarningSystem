// Ionic Starter App

angular.module('PreWarning', ['ionic', 'PreWarning.controllers', 'PreWarning.services', 'PreWarning.directives', 'ngCordova'])

.run(function ($ionicPlatform, SettingsService, ParseService) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        /*
            Init All Settings Here
        */
        SettingsService.settings.appTest = true;

        /**
            Initialize Parse Service
        */
        ParseService.init().then(
            function (user) {
                console.log("run: " + user);
            },
            function (err) {
                console.log("run: " + err);
                //No User found, so do login

            }
        );
        // on sign in, add the user pointer to the Installation
        parsePlugin.initialize(ParseService.appId, ParseService.clientKey, function () {

            parsePlugin.getInstallationObjectId(function (id) {
                // Success! You can now use Parse REST API to modify the Installation
                // see: https://parse.com/docs/rest/guide#objects for more info
                console.log("installation object id: " + id);
            }, function (error) {
                console.error('Error getting installation object id. ' + error);
            });

        }, function (e) {
            alert('Error initializing.');
        });

        ParseService.registerCallback();




        /**
        Check Network Status
        **/


        //        document.addEventListener("offline", isOffline, false);
        //        document.addEventListener("online", isOnline, false);
        //
        //
        //
        //        function isOffline() {
        //            SettingsService.setOfflineStatus(true);
        //            console.log("event:offline");
        //        }
        //
        //        function isOnline() {
        //            /*
        //            *    Init Baidu Push Service
        //            */
        //            fastgoPushNotification.init(BaiduPushService.apiKey);
        //            
        //            SettingsService.setOfflineStatus(false);
        //            console.log("event:online");
        //        }



    });


})

.config(function ($stateProvider, $urlRouterProvider, $compileProvider, $sceDelegateProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
        .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:

    .state('tab.receive', {
            url: '/receive',
            views: {
                'tab-receive': {
                    templateUrl: 'templates/tab-receive.html',
                    controller: 'ReceiveCtrl'
                }
            }
        })
        .state('tab.send', {
            url: '/send',
            views: {
                'tab-send': {
                    templateUrl: 'templates/tab-send.html',
                    controller: 'SendCtrl'
                }
            }
        })
        .state('tab.settings', {
            url: '/settings',
            views: {
                'tab-settings': {
                    templateUrl: 'templates/tab-settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('tab.start', {
            url: '/start',
            views: {
                'tab-start': {
                    templateUrl: 'templates/tab-start.html',
                    controller: 'StartCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/start');


    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image\//);

    //    $sceDelegateProvider.resourceUrlWhitelist([
    //           // Allow same origin resource loads.
    //           'self',
    //           // Allow loading from our assets domain. * and**.
    //           'http=s://api.jpush.cn/v3/push']);
});