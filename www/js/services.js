angular.module('PreWarning.services', []).factory("Contacts", function () {
    var Contacts = {};

    Contacts.list = [];
    Contacts.lastRefreshed ="Never";
    Contacts.add = function (contact) {
        Contacts.list.push(contact);
        Contacts.lastRefreshed = Date.now();
    };
    Contacts.clear = function () {
        Contacts.list = [];
    };

    return Contacts;
})

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

    };
    var _contacts = [];

    var _updateContacts = function (newContactsList) {
        _contacts = newContactsList;
    };

    return {
        settings: settings,
        setOfflineStatus: function (status) {
            console.log(status);
            settings.isOffline = status;
            console.log(settings.isOffline);
        },
        contacts: _contacts,
        updateContacts: function (newContactsList) {
            _contacts = newContactsList;
        },
    };
    }])

.service('ParseService', ['$sce', 'Contacts',
    function ($sce, Contacts) {
        /**
         *   Variables and constants
         */
        var _appId = "xT5AKbQJvofdDgjUBzJhFPgTeuPZ97ux854Biy31";
        var _clientKey = "PsNI6F4VeSO0m2yaHLn6uYnoaN8X7sbUJ7nOj1wE";
        var _jsKey = "YNFW7qk1gKUIxE2RiOGJFKIPyGtdorus8E1mPCyr";
        var _restAPIKey = "gJwHkPD7RtIrF1kqLyg1rqbtvcRKeitNijAKXcAg";

        /**
         *   Functions
         */

        var _init = function () {
            Parse.initialize(_appId, _jsKey);
            console.log("Called Parse Init Service");
        };

        var _createContact = function (firstName, lastName) {
            if (Parse)
                console.log("Parse Present");
            else
                console.log("Parse NOT Present");

            var Contacts = Parse.Object.extend("Contacts");
            var person = new Contacts();
            person.set("firstName", firstName);
            person.set("lastName", lastName);
            person.save(null, {});
            console.log("Saved Person" + firstName + lastName);
        };
        var _refreshContacts = function (params) {
            Contacts.clear();
            //            var PeopleObject = Parse.Object.extend("Contacts");
            var ContactsObj = Parse.Object.extend("Contacts");
            var query = new Parse.Query(ContactsObj);

            if (params !== undefined) {
                if (params.lastname !== undefined) {
                    query.equalTo("lastName", params.lastName);
                }
                if (params.firstname !== undefined) {
                    query.equalTo("firstName", params.firstName);
                }
            }

            query.find({
                success: function (results) {

                    console.log("Successfully retrieved " + results.length + " people!");

                    for (var i = 0; i < results.length; i++) {
                        //                        var contact = results[i];
                        //                        console.log(results[i]);
                      
                        Contacts.add(results[i]);
                          console.log(JSON.stringify(Contacts.list));
                    }
                    //                    console.log(_contacts);

                },
                error: function (error) {
                    alert("Error: " + error.code + " " + error.message);
                }
            });
        };

        var _getContacts = function () {
            if (Contacts.lastRefreshed === "Never")
                _refreshContacts();

            JSON.stringify(Contacts.list);
            return Contacts.list;
        };

        var formatContact = function (contact) {
            return {
                "displayName": contact.name.formatted || contact.name.givenName + " " + contact.name.familyName || "Mystery Person",
                "emails": contact.emails || [],
                "phones": contact.phoneNumbers || [],
                "photos": contact.photos || []
            };
        };


        return {
            createContact: _createContact,
            refreshContacts: _refreshContacts,
            appId: _appId,
            clientKey: _clientKey,
            restAPIKey: _restAPIKey,
            init: _init,
        };
        }]);