// Pre Warning System

angular.module('PreWarningSystem', ['ionic', 'PreWarningSystem.controllers', 'PreWarningSystem.services', 'PreWarningSystem.directives', 'ngCordova','ionic.service.core'])

.run(function ($ionicPlatform, SettingsService, ParseService, BackgroundService, $localstorage) {
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
                console.log("Init Success! with user:" + JSON.stringify(user));
            },
            function (err) {
                console.log("error: " + JSON.stringify(err));
                //No User found, so do login

            }
        );
        // on sign in, add the user pointer to the Installation
        parsePlugin.initialize(ParseService.appId, ParseService.clientKey, function () {
            //Check if parse is already initialised. If no object id is found, do a init.

            parsePlugin.getInstallationObjectId(function (id) {

                $localstorage.set('installationId', id);
                console.log("installation id: " + $localstorage.get('installationId', ""));
            }, function (error) {
                console.error('Error getting installation object id. ' + error);
            });

        }, function (e) {
            alert('Error initializing.' + e);
        });

        ParseService.registerCallback();

        //Start Background Service by default
        BackgroundService.enable();

    });


})

.config(['$stateProvider', '$urlRouterProvider', '$compileProvider', function ($stateProvider, $urlRouterProvider, $compileProvider) {

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
        .state('tab.account', {
            url: '/account',
            views: {
                'tab-account': {
                    templateUrl: 'templates/tab-account.html',
                    controller: 'AccountCtrl'
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/account');


    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image\//);

    
}])
.config(['$ionicAppProvider', function($ionicAppProvider) {
  //Identify the Ionic App
    $ionicAppProvider.identify({
        // The App ID for the server
        app_id: 'b406d6a7',
        // The API key all services will use for this app
        api_key: 'dfed80e686e8f52c3edec5eaccbc265f48ec6c2dd54a9cff'
    });
}]);