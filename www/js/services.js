angular.module('PreWarning.services', [])

.service("ContactsService", ['$q', function ($q) {
        var formatContact = function (contact) {
            return {
                "displayName": contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Mystery Person",
                "emails": contact.emails || [],
                "phones": contact.phoneNumbers || [],
                "photos": contact.photos || []
            };
        };

        var _pickContact = function () {
            var deferred = $q.defer();
            if (navigator && navigator.contacts) {
                navigator.contacts.pickContact(function (contact) {
                    deferred.resolve(formatContact(contact));
                });
            } else {
                deferred.reject("Bummer.  No contacts in desktop browser");
            }
            return deferred.promise;
        };

        return {
            pickContact: _pickContact

        };

    }])
    .service("SettingsService", [function () {
        var settings = {
            'smsListenerOn': false,
            'interceptEnabled': true,
            'filters': {
                box: '',
                read: 0,
                indexFrom: 0,
                maxCount: 5,
            },
            'smsDelayTime': 2000, // in milli seconds
            'isOffline': false,
            'audioSrc': {
                'left': 'media/see_left.mp3',
                'right': 'media/see_right.mp3',
            },
            //                    'currentAudioSrc':'',
            'vibrationEnabled': true,
            'soundEnabled': true,
            'vibrationDuration': 1000,
            'vibrationDelay': 100,
            'vibrationRepeat': 2,
            'jpush': {
                'appKey': '365639d4dda80a3c95ec1713',
                'secret': 'cad347934ba1f104b658c27d'
            }
        };

        return {
            settings: settings,
            setOfflineStatus: function (status) {
                console.log(status);
                settings.isOffline = status;
                console.log(settings.isOffline);
            }
        };
    }])

.service('JPushService', ['$http', '$sce', function ($http, $sce) {
    var jpush;
    return {
        jpush: jpush,
        init: function () {


            jPush = window.plugins.jPushPlugin; //getjpush reference
            jpush.init();
            jpush.getRegistrationID(function (id) {
                jpush.registrationID = id;
            });
        },
        sendMessage: function () {
            
            var authdata = btoa('365639d4dda80a3c95ec1713' + ':' + 'cad347934ba1f104b658c27d');
            //            $sce.trustAsUrl("https://api.jpush.cn/v3/push");
            $sce.trustAsResourceUrl("https://api.jpush.cn/v3/push");
            $http.defaults.headers.common.Authorization = 'Basic ' + authdata;

            // Simple POST request example (passing data) :
            //            $http.post('https://api.jpush.cn/v3/push', {
            //                'notification': {"alert":"hello word!"}
            //            })
            var req = {
                method: 'POST',
                url: 'https://api.jpush.cn/v3/push',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    test: 'test'
                }
            };
            $http(req).success(function (data) {
                            console.log("data: " + data);
                        }).
                        error(function (data) {
                            console.log("err data: " + data);
            
                        });

            //            $cookieStore.put('globals', $rootScope.globals);

        }
    };

}]);