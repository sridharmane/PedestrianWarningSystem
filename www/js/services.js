angular.module('warningApp.services', [])

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
                    'smsDelayTime': 2, // in seconds
                    'isOffline':true
                };

                return {
                    settings: settings,
                    setOfflineStatus:function(status){
                        console.log(status);
                        settings.isOffline = status;
                        console.log(settings.isOffline);
                    }
                };
    }]);