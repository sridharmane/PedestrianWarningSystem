// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('warningApp', ['ionic', 'warningApp.controllers', 'warningApp.services'])

.run(function($ionicPlatform) {
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
  });
})

.config(function($stateProvider, $urlRouterProvider) {

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

});

angular.module('warningApp.controllers', [])

.controller('ReceiveCtrl', function ($scope) {})

.controller('SendCtrl', ['$scope','$ionicModal','$cordovaContacts',function ($scope, $ionicModal,$cordovaContacts) {

    // Get all the contacts from the Contacts service
//    $scope.contacts = ContactsService.getAll();
    console.log(PickContact);
    $scope.selectContact = function (contactID) {
        $scope.selectedID = contactID;
        $scope.closeModal();
    };

    $ionicModal.fromTemplateUrl('templates/contacts-list.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });
    $scope.openModal = function () {
        $scope.modal.show();
    };
    $scope.closeModal = function () {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });
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
    .controller('SettingsCtrl', function ($scope, $window, $timeout) {
        $scope.settings = {
            'user': {
                'accessToken': '',
                'name': '',
                'email': ''
            }
        };



    });
angular.module('warningApp.services', [])
.factory('ContactsService', ['$scope',function ($scope) {
    // Might use a resource here that returns a JSON array
 
    // Some fake testing data
    var contacts = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, { 
        id: 2,
        name: 'Andrew Jostlin',
        lastText: 'Did you get the ice cream?',
        face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
  }, {
        id: 3,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
        id: 4,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
  }];

    return {
        getAll: function () {
            return contacts;
        },
        remove: function (chat) {
            contacts.splice(contacts.indexOf(chat), 1);
        },
        get: function (contactId) {
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].id === parseInt(contactId)) {
                    return contacts[i];
                }
            }
            return null;
        }
    };
}]);