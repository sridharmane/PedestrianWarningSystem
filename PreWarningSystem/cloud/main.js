// Use Parse.Cloud.define to define as many cloud functions as you want.

Parse.Cloud.define("sendPush", function (request, response) {
    var r = JSON.parse(request.body);

    var query = "";
    if (r.contact.username !== "udefined" || r.contact.username !== "") {
        console.log("Selecting User:" + r.contact.username);
        query = new Parse.Query(Parse.User);
        query.equalTo("username", r.contact.username);
    }
    if (Object.keys(r.channel).length !== 0) {
        query = new Parse.Query(Parse.Installation);
        query.equalTo("channels", r.channel);
    }
    var expirationTime = new Date(JSON.stringify(r.timeSent));
    expirationTime = expirationTime.setSeconds(expirationTime.getSeconds()+10);
    //Send Push
    Parse.Push.send({
        where: query,
        expiration_time:expirationTime,//Set expiry time to 10 seconds
        data: {
            settings: r.settings,
            notification: r.notification,
            timeSent: r.timeSent,
        }
    }, {
        success: function () {
            response.success("Push Success");
        },
        error: function (error) {
            response.error("Push failed with error: " + JSON.stringify(error));
        }
    });
});

Parse.Cloud.define("subscribeToChannel", function (request, response) {
    var channelName = request.channel;
    var username = request.username;

    if (!channelName) {
        response.error("Missing parameter: channel");
        return;
    }

    if (!username) {
        response.error("Missing parameter: username");
        return;
    }

    // Create a Pointer to this user based on their object id
    var user = new Parse.User();
    user.username = username;

    // Need the Master Key to update Installations
    Parse.Cloud.useMasterKey();

    // A user might have more than one Installation
    var query = new Parse.Query(Parse.Installation);
    query.equalTo("user", user); // Match Installations with a pointer to this User
    query.find({
        success: function (installations) {
            for (var i = 0; i < installations.length; ++i) {
                // Add the channel to all the installations for this user
                installations[i].addUnique("channels", channel);
            }

            // Save all the installations
            Parse.Object.saveAll(installations, {
                success: function (installations) {
                    // All the installations were saved.
                    response.success("All the installations were updated with this channel.");
                },
                error: function (error) {
                    // An error occurred while saving one of the objects.
                    console.error(error);
                    response.error("An error occurred while updating this user's installations.")
                },
            });
        },
        error: function (error) {
            console.error(error);
            response.error("An error occurred while looking up this user's installations.")
        }
    });
});

Parse.Cloud.define("updateUsername", function (request, response) {
    var r = JSON.parse(request.body);
    var username = r.username;
    var installationId = r.installationId;

    if (!username) {
        response.error("Missing parameter: username");
        return;
    }
    if (!installationId) {
        response.error("Missing parameter: installationId");
        return;
    }

    // Need the Master Key to update Installations
    Parse.Cloud.useMasterKey();

    // A user might have more than one Installation
    var query = new Parse.Query(Parse.Installation);
    query.equalTo("objectId", installationId); // Match Installations with a pointer to this User
    query.first({
        success: function (installation) {
            console.log("installations: " + JSON.stringify(installation));
            console.log("updating installation :" + installation + "with username: " + username);
            installation.set("username", username);


            // Save all the installations
            Parse.Object.saveAll(installation, {
                success: function (installation) {
                    // All the installations were saved.
                    response.success("All the installations were updated with this username.");
                },
                error: function (error) {
                    // An error occurred while saving one of the objects.
                    console.error(error);
                    response.error("An error occurred while updating this user's installations.");
                },
            });
        },
        error: function (error) {
            console.error(error);
            response.error("An error occurred while looking up this user's installations.")
        }
    });
});