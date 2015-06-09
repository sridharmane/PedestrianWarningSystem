// Ionic Starter App

angular.module('PreWarning', ['ionic', 'PreWarning.controllers', 'PreWarning.services', 'ngCordova'])

.run(function ($ionicPlatform, SettingsService) {
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
        Check Network Status
        **/


        document.addEventListener("offline", isOffline, false);
        document.addEventListener("online", isOnline, false);



        function isOffline() {
            SettingsService.setOfflineStatus(true);
            console.log("event:offline");
        }

        function isOnline() {
            SettingsService.setOfflineStatus(false);
            console.log("event:online");
        }

    });


})

.config(function ($stateProvider, $urlRouterProvider, $compileProvider,$sceDelegateProvider) {

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
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/send');


    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image\//);

//    $sceDelegateProvider.resourceUrlWhitelist([
//           // Allow same origin resource loads.
//           'self',
//           // Allow loading from our assets domain. * and**.
//           'http=s://api.jpush.cn/v3/push']);
});