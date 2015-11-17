// Pedestrian Warning System
angular.module('PedestrianWarningSystem', [
  'ionic','ionic.service.core',

  'PedestrianWarningSystem.controllers',
  'PedestrianWarningSystem.services',
  'PedestrianWarningSystem.directives',
  'ngCordova',
  'firebase'
])
.constant('ApiEndpoint', {
  url: 'http://192.168.1.10:35729/'
})
.run(function ($ionicPlatform, SettingsService, ParseService, KeepAwakeService, $state) {
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
    Initialize Parse Service, return installationId
    */
    ParseService.init().then(
      function (installationId) {
        console.log(installationId);

      },
      function (err) {
        console.error("Init Error : " + JSON.stringify(err));
      }
    );
    // kick off the platform web client
    Ionic.io();

    var currentUser = ParseService.getCurrentUser();
    if(currentUser === undefined || currentUser === null){
      console.log("No User Session available. Redirecting to account tab");
      $state.go("tab.account");
    }else{
      console.log(currentUser);
    }

    //Start Background Service by default
    //        BackgroundService.enable();
    //Keep Screen Awake by default
    // KeepAwakeService.toggleKeepAwake();

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
.config(['$ionicAppProvider', function ($ionicAppProvider) {
  //Identify the Ionic App
  $ionicAppProvider.identify({
    // The App ID for the server
    app_id: 'b406d6a7',
    // The API key all services will use for this app
    api_key: 'dfed80e686e8f52c3edec5eaccbc265f48ec6c2dd54a9cff'
  });
}]);
