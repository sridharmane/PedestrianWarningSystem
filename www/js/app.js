// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('warningApp', ['ionic', 'warningApp.controllers', 'warningApp.services','ngCordova'])

.run(function($ionicPlatform,SettingsService) { 
  $ionicPlatform.ready(function() {
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

.config(function($stateProvider, $urlRouterProvider,$compileProvider) {

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

});
