angular.module('PedestrianWarningSystem.services', [])
.factory("Contacts", function () {
  var Contacts = {};

  Contacts.list = [];
  Contacts.contactsLastRefreshed = null;
  Contacts.addContact = function (contact) {
    //            console.log(JSON.stringify(contact));
    Contacts.list.push(contact);
    Contacts.contactsLastRefreshed = new Date();
    console.log("Contacts Refreshed on :" + Contacts.contactsLastRefreshed);
  };
  Contacts.updateContactsList = function (contacts) {
    Contacts.list = contacts;
    Contacts.contactsLastRefreshed = new Date();
    console.log("Contacts Refreshed on :" + Contacts.contactsLastRefreshed);
  };
  Contacts.clearContacts = function () {
    Contacts.list = [];
  };

  return Contacts;
})
.factory('$localstorage', ['$window', function ($window) {
  return {
    set: function (key, value) {
      $window.localStorage[key] = value;
    },
    get: function (key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function (key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function (key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  };
}])

.service("SettingsService", [function () {
  this.settings = {

    'delayTime': 2000, // in milli seconds
    'isOffline': false,
    'voicePromptEnabled': true,
    'vibrationEnabled': true,
    'vibrationDuration': 1000,
    'vibrationDelay': 100,
    'vibrationRepeat': 2,
    'backgroundModeEnabled': true, //Set this to true to get notificaitons in the background.
    'keepAwake': true, //Device never sleeps if this is enabled

  };
  this.setVibrationStatus = function (status) {
    settings.vibrationEnabled = status;
  };
  this.setSoundStatus = function (status) {
    settings.soundEnabled = status;
  };
  this.setVibrationPattern = function (pattern) {
    if (pattern.length === 3) {
      settings.vibrationDuration = pattern[0];
      settings.vibrationDelay = pattern[1];
      settings.vibrationRepeat = pattern[2];
    }
  };
  this.setDelayTime = function (delay) {
    settings.delayTime = delay;
  };

  return this;
}])
.service("NotifyService", ['SettingsService', '$cordovaToast', '$cordovaMedia', '$cordovaVibration','$q',
function (SettingsService, $cordovaToast, $cordovaMedia, $cordovaVibration,$q) {
  this.voicePrompts ={
    src1:"",
    src2:"",
    src3:""
  };
  this.lastPush = {
    timeDifference: 1234,
    timeSinceReceived: 0,

    notificationPlayed: false,
    notification: {
      carDirection: "left",
      voicePromptNumber: "verFast"
    }
  };
  this.getLastPush = function () {
    return this.lastPush;
  };

  this.toast = function (text) {
    try {

      $cordovaToast.showLongBottom(text);
    } catch (e) {
      console.error(e);
      this.log(text);
    }
  };
  this.log = function (text) {
    console.log("NotifyService: " + JSON.stringify(text));
  };

  this.vibrate = function (pattern) {
    $cordovaVibration.vibrate(pattern);
    this.log("Vibrating with pattern:" + pattern + " ");
  };

  this.playVoicePrompt = function (voicePromptNumber) {
    var src = this.voicePrompts["src"+voicePromptNumber];
    console.log(src);
    //Check if  Media Plugin is available. If available, use it to notify.
    // if ($cordovaMedia) {
    //   var media = $cordovaMedia.newMedia(src);
    //   // console.log(media);
    //   media.play();
    //   this.log("Played Sound");
    // } else { //Fallback to html5 audio
    this.log("Using HTML5 Audio");
    var audio = document.getElementById("audio");
    audio.src = src;
    audio.play();
    this.log("Played Sound");
    // }

  };



  this.notify = function (notification) {
    var defer = $q.defer();
    var response = {
      voicePromptPlayed:false,
      vibrattionPlayed:false
    };
    this.log("Notifying User");
    //timestamp when notification will be played
    if (notification.voicePromptEnabled) {
      this.playVoicePrompt(notification.voicePromptNumber);
      response.voicePromptPlayed = true;
      response.timeVoicePromptPlayed = Date.now();
    }
    if (notification.vibrationEnabled) {
      this.vibrate(notification.vibrationPattern);
      response.vibrattionPlayed = true;
      response.timeVibrationPlayed = Date.now();
    }
    this.log("Notify Status",response);

    defer.resolve(response);

    return defer.promise;
  };

  this.secondsToHMS = function (secs) {
    function z(n) {
      return (n < 10 ? '0' : '') + n;
    }
    var sign = secs < 0 ? '-' : '';
    secs = Math.abs(secs);
    return sign + z(secs / 3600 | 0) + ':' + z((secs % 3600) / 60 | 0) + ':' + z(secs % 60);
  };

  this.getTimeDiff = function (timeReceived, timeSent) {
    var diffMilliseconds = timeReceived - timeSent;
    var diffSeconds = diffMilliseconds / 1000;
    this.log("Time Difference: " + diffMilliseconds);
    //                return _secondsToHMS(diffSeconds);
    return diffMilliseconds;
  };
  return this;

}])

.service('KeepAwakeService', ['SettingsService', '$cordovaToast', function (SettingsService, $cordovaToast) {
  this.keepAwake = function () {
    window.plugins.insomnia.keepAwake();
    NotifyService.toast("On");
  };
  this.allowSleepAgain = function () {
    window.plugins.insomnia.allowSleepAgain();
    NotifyService.toast("Off");
  };
  this.toggleKeepAwake = function () {
    if (SettingsService.settings.keepAwake) {
      this.keepAwake();
    } else {
      this.allowSleepAgain();
    }
  };
  return this;
}])
.service('BackgroundService', ['$cordovaToast',
function ($cordovaToast) {
  var backgroundModeSettings = {
    silent: true,
  };
  this.enable = function () {
    if (cordova.plugins.backgroundMode) {
      cordova.plugins.backgroundMode.configure(backgroundModeSettings);
      cordova.plugins.backgroundMode.enable();
      if (this.isEnabled)
      NotifyService.toast("BackgroundService Enabled");
    } else {
      NotifyService.toast("BackgroundService Not Available");
    }
  };
  this.disable = function () {
    if (cordova.plugins.backgroundMode) {
      cordova.plugins.backgroundMode.disable();
      if (!this.isEnabled)
      NotifyService.toast("BackgroundService Disabled");
    } else {
      NotifyService.toast("BackgroundService Not Available");
    }
  };
  this.isEnabled = function () {
    return cordova.plugins.backgroundMode.isEnabled();
  };

  this.toggleBackgroundMode = function () {
    cordova.plugins.backgroundMode.onfailure = function (errorCode) {
      NotifyService.toast("Error in BG Mode :" + errorCode);
    };
    if (this.isEnabled()) {
      this.disable();
    } else {
      this.enable();
    }
  };

  return this;

}])


.factory('ParseService', ['$q', 'Contacts', 'SettingsService', 'NotifyService', '$localstorage',
function ($q, Contacts, SettingsService, NotifyService, $localstorage) {
  /**
  *   Variables and constants
  */
  var appId = "xT5AKbQJvofdDgjUBzJhFPgTeuPZ97ux854Biy31";
  var clientKey = "PsNI6F4VeSO0m2yaHLn6uYnoaN8X7sbUJ7nOj1wE";
  var jsKey = "YNFW7qk1gKUIxE2RiOGJFKIPyGtdorus8E1mPCyr";
  var restAPIKey = "gJwHkPD7RtIrF1kqLyg1rqbtvcRKeitNijAKXcAg";
  var installationId = '';


  /**
  *   Functions
  */

  this.init = function () {
    var defer = $q.defer();
    Parse.initialize(appId, jsKey);


    this.getVoicePromptSources();
    return defer.promise;
  };



  this.refreshContactsList = function () {
    var query = new Parse.Query(Parse.User);
    query.find({
      success: function (contacts) {
        var contactsJson = JSON.parse(JSON.stringify(contacts));
        var contactsList = [];
        for (var i = 0; i < contactsJson.length; i++) {
          contactsList.push(contactsJson[i]);
        }
        console.log(contactsList);
        Contacts.updateContactsList(contactsList);
      }
    });
  };


  this.getContacts = function () {
    if (Contacts.contactsLastRefreshed === null)
    this.refreshContactsList();
    return Contacts.list;
  };

  this.getCurrentUser = function () {

    try {
      return Parse.User.current();
    } catch (e) {
      return null;
    }
  };


  this.login = function (username, password) {
    //Logout current user
    Parse.User.logOut();

    var defer = $q.defer();

    Parse.User.logIn(username, password, {
      success: function (user) {
        defer.resolve(JSON.parse(JSON.stringify(user)));
      },
      error: function (user,error) {
        defer.reject(error);
      }
    });
    return defer.promise;

  };
  this.logout = function () {
    if (this.getCurrentUser()){
      NotifyService.log("Loging out current user with username:" + JSON.stringify(this.getCurrentUser()));
    }
    else{
      NotifyService.log("No user to logout " + JSON.stringify(this.getCurrentUser()));
    }
    Parse.User.logOut();
  };
  this.signUp = function (username, password, email, name) {

    //Logout current user
    Parse.User.logOut();

    var defer = $q.defer();

    //Creating new User
    var user = new Parse.User();
    //Min required for using Parse signup feature
    user.set("username", username);
    user.set("password", password);
    user.set("email", email);

    //Extra preperties
    user.set("name", name);

    //do the signup using the parse api
    user.signUp(null, {
      success: function (data) {
        // Hooray! Let them use the app now.
        var user = JSON.parse(JSON.stringify(data));
        defer.resolve(user);
      },
      error: function (user,error) {
        defer.reject(error.message);
      }
    });
    return defer.promise;
  };



  //Get JWT auth token from cloud code to authenticate user on firebasevar
  this.getAuthToken = function () {
    Parse.Cloud.run('getAuthToken', Parse.User.current(), {
      success: function (result) {
        NotifyService.log(JSON.stringify(result));
      },
      error: function (error) {
        NotifyService.log(JSON.stringify(error));
      }
    });
  };

  //Getting voiceprompt source from Parse Config
  this.getVoicePromptSources = function(){
    Parse.Config.get().then(
      function(config){
        NotifyService.voicePrompts.src1 = config.get('voicePrompt1').url();
        NotifyService.voicePrompts.src2 = config.get('voicePrompt2').url();
        NotifyService.voicePrompts.src3 = config.get('voicePrompt3').url();
        console.log(NotifyService.voicePrompts);
      }
    );
    // console.log(Parse.Config.get("voicePrompt1"));
  };

  return this;
}])

.service('FirebaseService', ['$q', '$http','$filter','$firebaseArray','NotifyService','ParseService','$cordovaFile',
function($q, $http, $filter, $firebaseArray,NotifyService,ParseService,$cordovaFile) {
  FirebaseService = this;
  //Firebase app constants
  var endPoint = "https://glaring-heat-7824.firebaseio.com/";
  var notificationsRef = new Firebase(endPoint+"notifications");
  //First create empty array, will be populated automatically once firebase initializes
  FirebaseService.notifications = [];

  //Create Notification`
  FirebaseService.saveNotification = function(notification){
    notificationsRef.push(notification);
  };

  // Retrieve new posts as they are added to our database
  notificationsRef.orderByChild("notificationPlayed")
  .equalTo(false)
  .on("child_added", function(snapshot, prevChildKey) {
    var notif = snapshot.val();
    var ref = snapshot.ref();
    console.log(snapshot.key());
    // if(currentUser === null){
    //   currentUser = ParseService.getCurrentUser();
    // }

    if(notif.timeSent && !notif.timeReceived && !notif.notificationPlayed){
      var timestamp = Date.now();
      var timeDifference = timestamp - notif.timeSent;
      ref.child("timeReceived").set(timestamp);
      ref.child("timeDifference").set(timeDifference);
      //Add to notifications list.
      FirebaseService.notifications.push(notif);

      NotifyService.notify(notif).then(function(notifStatus){

        if (notifStatus.voicePromptPlayed) {
          ref.child("voicePromptPlayed").set(true);
          ref.child("timeVoicePromptPlayed").set(notifStatus.timeVoicePromptPlayed);
        }
        if (notifStatus.vibrationPlayed) {
          ref.child("vibrationPlayed").set(true);
          ref.child("timeVibrationPlayed").set(notifStatus.timeVibrationPlayed);
        }
        if(notifStatus.voicePromptPlayed || notifStatus.vibrationPlayed){
          ref.child("notificationPlayed").set(true);
        }
      });

    }
    else{
      //Notification already played.
      //Add to notifications list.
      FirebaseService.notifications.push(notif);
    }

  });
  return FirebaseService;
}])

.factory('Notification',["FirebaseService","ParseService",function(FirebaseService,ParseService){
  //Defining Notificaiton constructor function
  var Notification = function(notifParams) {

    //Create the notification Object
    this.notification = {};
    console.log(notifParams);
    //Check if vibration was enabled
    if(notifParams.vibrationEnabled){
      /*
      Build Vibration Pattern
      [NumberOfTimesToRepeat,DurationOfEachVibration,DelayBetweenVibrations]
      */
      var vibrationPattern = [];
      for (var i = 0; i < notifParams.vibrationRepeat; i++) {
        vibrationPattern.push(notifParams.vibrationDuration);
        vibrationPattern.push(notifParams.vibrationDelay);
      }
      this.notification.vibrationEnabled = true;
      this.notification.vibrationRepeat = notifParams.vibrationRepeat;
      this.notification.vibrationDuration = notifParams.vibrationDuration;
      this.notification.vibrationDelay = notifParams.vibrationDelay;
      this.notification.vibrationPattern = vibrationPattern;
    }else{
      this.notification.vibrationEnabled = false;
      this.notification.vibrationRepeat = 0;
      this.notification.vibrationDuration = 0;
      this.notification.vibrationDelay = 0;
      this.notification.vibrationPattern = [];
    }
    //Check if Voice Prompts are enabled
    if(notifParams.voicePromptEnabled){
      this.notification.voicePromptEnabled = true;
      this.notification.voicePromptNumber = notifParams.voicePromptNumber;
    }else{
      this.notification.voicePromptEnabled = false;
      this.notification.voicePromptNumber = 0;
    }
    var currentUser = ParseService.getCurrentUser();
    //Add From and To Fields
    this.notification.from = {
      objectId:  currentUser.id,
      name : currentUser.attributes.name
    };

    this.notification.notificationPlayed = false;
    this.notification.timeNotificationPlayed = 0;
    //Set the delay time
    this.notification.delayTime = notifParams.delayTime;
    console.log(this.notification);
  };
  // Define the "instance" methods using the prototype
  // and standard prototypal inheritance.
  Notification.prototype.sendTo = function(toUser) {
    this.notification.to = toUser;
    this.notification.timeSent = Date.now();
    FirebaseService.saveNotification(this.notification);
    console.log("Sent Notification");
    console.log(this.notification);
    return "ok";
  };
  Notification.prototype.test = function(){
    console.log("Blah");
    return "Ok";
  };
  return Notification;
}]);
