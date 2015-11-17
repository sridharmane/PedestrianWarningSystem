angular.module('PedestrianWarningSystem.controllers', [])
.controller('AccountCtrl', ['$scope', 'ParseService', '$ionicModal','$ionicPopup', '$localstorage', 'NotifyService','FirebaseService',
function ($scope, ParseService, $ionicModal,$ionicPopup, $localstorage, NotifyService,FirebaseService) {
  $scope.loginData = {
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    groups: [],
    pass: '',
  };

  $scope.currentUser = ParseService.getCurrentUser();


  var deploy = new Ionic.Deploy();

  deploy.watch().then(function() {}, function() {},
  function(hasUpdate) {
    console.log("has Update");
    $scope.doUpdate();
  });

  // Update app code with new release from Ionic Deploy
  $scope.doUpdate = function() {
    deploy.update().then(function(res) {
      console.log('Ionic Deploy: Update Success! ', res);
    }, function(err) {
      console.log('Ionic Deploy: Update error! ', err);
    }, function(prog) {
      console.log('Ionic Deploy: Progress... ', prog);
    });
  };

  // Check Ionic Deploy for new code
  $scope.checkForUpdates = function() {
    console.log('Ionic Deploy: Checking for updates');
    deploy.check().then(function(hasUpdate) {
      console.log('Ionic Deploy: Update available: ' + hasUpdate);
      $scope.hasUpdate = hasUpdate;
    }, function(err) {
      console.error('Ionic Deploy: Unable to check for updates', err);
    });
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
    $scope.currentUser = null;
  };
  $scope.hideLogin = function () {
    $scope.modalLogin.hide();
  };
  $scope.doLogin = function () {
    var promise = ParseService.login($scope.loginData.username, $scope.loginData.password)
    .then(function (user) {
      if (user) {
        console.log("doLogin: Returned from Parse: " + JSON.stringify(user));
        $scope.hideLogin();
        $scope.currentUser = ParseService.getCurrentUser();
      }
    }, function (error) {
      NotifyService.toast(error);
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
    //            params username, password, firstName, lastName, email, groups
    ParseService.signUp($scope.loginData.username,
      $scope.loginData.password,
      $scope.loginData.email,
      $scope.loginData.name)
      .then(function (user) {

          $scope.currentUser = ParseService.getCurrentUser();

      }, function (error) {
        NotifyService.toast(error);
      });
    };


    $scope.exportNotificaitons = function() {
      $scope.isExportInProgress = true;
      $scope.exportMessage = "";
      $scope.sendEmail();
      FirebaseService.exportNotifications().then(
        function(success){
          $scope.isExportInProgress = false;
          $scope.exportMessage = success;
        },
      function(err){
        $scope.isExportInProgress = false;
        $scope.exportMessage = err;
      });
    };


    $scope.sendEmail = function(){
      $scope.logFileEmail = $scope.currentUser.attributes.email;
      var sendEmailPopup = $ionicPopup.show({
        templateUrl: 'templates/sendEmail.html',
        scope: $scope,
        title: 'Email Log File',
        subTitle: 'Send to this email ?',
        animation: 'slide-in-up',
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Send Email</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.logFileEmail) {
                //don't allow the user to close unless he enters wifi password
                e.preventDefault();
              } else {
                return $scope.logFileEmail;
              }
            }
          }
        ]
      }).then(function (popup) {
        console.log("Popup",popup);
        // $scope.semailPopup = popup;
      });
    };

  }
]
)
.controller('ReceiveCtrl', ['$scope', 'FirebaseService','ParseService', function ($scope, FirebaseService, ParseService) {
  $scope.currentUser = ParseService.getCurrentUser();

  $scope.notifications = FirebaseService.notifications;

}])

.controller('SendCtrl', ['$scope', 'ParseService', 'SettingsService', 'Contacts','FirebaseService', '$cordovaNetwork', '$cordovaToast', '$http', '$sce', '$ionicModal','Notification','NotifyService',
function ($scope, ParseService, SettingsService, Contacts, FirebaseService, $cordovaNetwork, $cordovaToast, $http, $sce, $ionicModal,Notification,NotifyService) {

  $scope.settings = SettingsService.settings;
  $scope.lastRefreshed = Contacts.lastRefreshed;
  var baseUrl = "https://api.parse.com/1/";
  var pushUrl = "push";

  $scope.currentUser = ParseService.getCurrentUser();

  $scope.contacts = [];

  // $scope.settings.voicePromptEnabled = true;
  $scope.voicePromptNumber =1;
  // $scope.vibrationEnabled =true;

  $scope.selected = {
    contact: {}
  };

  $ionicModal.fromTemplateUrl('templates/contacts-list.html', {
    scope: $scope,
    animation: 'slide-in-up',
    //        controller: 'SendCtrl'
  }).then(function (modal) {
    $scope.getContacts();
    $scope.modalContacts = modal;
  });
  $scope.showContacts = function () {
    $scope.getContacts();
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
  $scope.getContactsLastRefreshed = function () {
    return Contacts.contactsLastRefreshed;
  };

  $scope.sendNotification = function () {
    var notifParams ={
      vibrationEnabled:$scope.settings.vibrationEnabled,
      delayTime:$scope.settings.delayTime,
      vibrationDuration:$scope.settings.vibrationDuration,
      vibrationDelay:$scope.settings.vibrationDelay,
      vibrationRepeat:$scope.settings.vibrationRepeat,
      voicePromptEnabled:$scope.settings.voicePromptEnabled,
      voicePromptNumber:$scope.voicePromptNumber
    };
    console.log(notifParams);
    var notification = new Notification(notifParams);
    console.log(notification);
    notification.sendTo({
      objectId : $scope.selected.contact.objectId,
      name : $scope.selected.contact.name
    });
    // $scope.clearSelection();
    NotifyService.toast("Notification Sent");
  };
  $scope.savePerson = function (fname, lname) {
    ParseService.savePerson(fname, lname);
  };
  $scope.getPeople = function (params) {
    ParseService.getPeople(params);
  };

  $scope.setVoicePrompt = function (fileNumber) {
    $scope.voicePromptNumber = fileNumber;
    console.log($scope.voicePromptNumber);
  };
  $scope.isVoicePromptBtnActive = function (fileNumber) {
    return fileNumber === $scope.voicePromptNumber;
  };
  $scope.setDirection = function (direction) {
    $scope.carDirection = direction;
    console.log($scope.carDirection);
  };
  $scope.isDirectionBtnActive = function (type) {
    return type === $scope.carDirection;
  };

  $scope.clearSelection = function () {
    $scope.voicePromptNumber = '';
    $scope.carDirection = '';
  };

}])

.controller('SettingsCtrl', ['$scope', 'SettingsService', 'BackgroundService', 'KeepAwakeService','NotifyService',
function ($scope, SettingsService, BackgroundService, KeepAwakeService,NotifyService) {
  $scope.settings = SettingsService.settings;

  $scope.toggleBackgroundMode = function () {
    BackgroundService.toggleBackgroundMode();
  };
  $scope.toggleKeepAwake = function () {
    KeepAwakeService.toggleKeepAwake();
  };
  $scope.playVoicePrompt = function(voicePromptNumber){
    NotifyService.playVoicePrompt(voicePromptNumber);
  };
}]);
