package org.apache.cordova.core;

import android.app.Application;
import android.util.Log;

import java.util.Set;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.apache.cordova.CordovaInterface;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.parse.Parse;
import com.parse.ParseInstallation;
import com.parse.PushService;

import android.util.Log;

public class ParsePlugin extends CordovaPlugin {

    private static final String TAG = "ParsePlugin";
    private static final String ACTION_INITIALIZE = "initialize";
    private static final String ACTION_GET_INSTALLATION_ID = "getInstallationId";
    private static final String ACTION_GET_INSTALLATION_OBJECT_ID = "getInstallationObjectId";
    private static final String ACTION_GET_SUBSCRIPTIONS = "getSubscriptions";
    private static final String ACTION_SUBSCRIBE = "subscribe";
    private static final String ACTION_UNSUBSCRIBE = "unsubscribe";
    private static final String ACTION_REGISTER_CALLBACK = "registerCallback";

    private static CordovaWebView sWebView;
    private static String sEventCallback = null;
    private static boolean sForeground = false;
    private static JSONObject sLaunchNotification = null;

    public static void initializeParseWithApplication(Application app) {
        String appId = getStringByKey(app, "parse_app_id");
        String clientKey = getStringByKey(app, "parse_client_key");
        Parse.enableLocalDatastore(app);
        Log.d(TAG, "Initializing with parse_app_id: " + appId + " and parse_client_key:" + clientKey);
        Parse.initialize(app, appId, clientKey);
    }

    private static String getStringByKey(Application app, String key) {
        int resourceId = app.getResources().getIdentifier(key, "string", app.getPackageName());
        return app.getString(resourceId);
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals(ACTION_REGISTER_CALLBACK)) {
            this.registerCallback(callbackContext, args);
            return true;
        }
        if (action.equals(ACTION_INITIALIZE)) {
            this.initialize(callbackContext, args);
            return true;
        }
        if (action.equals(ACTION_GET_INSTALLATION_ID)) {
            this.getInstallationId(callbackContext);
            return true;
        }

        if (action.equals(ACTION_GET_INSTALLATION_OBJECT_ID)) {
            this.getInstallationObjectId(callbackContext);
            return true;
        }
        if (action.equals(ACTION_GET_SUBSCRIPTIONS)) {
            this.getSubscriptions(callbackContext);
            return true;
        }
        if (action.equals(ACTION_SUBSCRIBE)) {
            this.subscribe(args.getString(0), callbackContext);
            return true;
        }
        if (action.equals(ACTION_UNSUBSCRIBE)) {
            this.unsubscribe(args.getString(0), callbackContext);
            return true;
        }
        return false;
    }

    private void registerCallback(final CallbackContext callbackContext, final JSONArray args) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    sEventCallback = args.getString(0);
                    callbackContext.success();
                    // if the app was opened from a notification, handle it now that the device is ready
                    handleLaunchNotification();
                } catch (JSONException e) {
                    callbackContext.error("JSONException");
                }
            }
        });
    }

    private void initialize(final CallbackContext callbackContext, final JSONArray args) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    String appId = args.getString(0);
                    String clientKey = args.getString(1);
                    Parse.initialize(cordova.getActivity(), appId, clientKey);
                    ParseInstallation.getCurrentInstallation().saveInBackground();
                    callbackContext.success();
                } catch (JSONException e) {
                    callbackContext.error("JSONException");
                }
            }
        });
    }

    private void getInstallationId(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                String installationId = ParseInstallation.getCurrentInstallation().getInstallationId();
                callbackContext.success(installationId);
            }
        });
    }

    private void getInstallationObjectId(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                String objectId = ParseInstallation.getCurrentInstallation().getObjectId();
                callbackContext.success(objectId);
            }
        });
    }

    private void getSubscriptions(final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                 Set<String> subscriptions = PushService.getSubscriptions(cordova.getActivity());
                 callbackContext.success(subscriptions.toString());
            }
        });
    }

    private void subscribe(final String channel, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                PushService.subscribe(cordova.getActivity(), channel, cordova.getActivity().getClass());
                callbackContext.success();
            }
        });
    }

    private void unsubscribe(final String channel, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                PushService.unsubscribe(cordova.getActivity(), channel);
                callbackContext.success();
            }
        });
    }

    /*
    * Use the cordova bridge to call the jsCB and pass it jsonPayload as param
    */
    public static void javascriptEventCallback(JSONObject jsonPayload) {
        if (sEventCallback != null && !sEventCallback.isEmpty() && sWebView != null) {
            String snippet = "javascript:" + sEventCallback + "(" + jsonPayload.toString() + ")";
            Log.v(TAG, "javascriptCB: " + snippet);
            sWebView.sendJavascript(snippet);
        }
    }

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        sEventCallback = null;
        sWebView = this.webView;
        sForeground = true;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        sEventCallback = null;
        sWebView = null;
        sForeground = false;
    }

    @Override
    public void onPause(boolean multitasking) {
        super.onPause(multitasking);
        sForeground = false;
    }

    @Override
    public void onResume(boolean multitasking) {
        super.onResume(multitasking);
        sForeground = true;
    }

    public static boolean isInForeground() {
        return sForeground;
    }

    public static void setLaunchNotification(JSONObject jsonPayload) {
        sLaunchNotification = jsonPayload;
    }

    private void handleLaunchNotification() {
        if (isInForeground() && sLaunchNotification != null) {
            javascriptEventCallback(sLaunchNotification);
            sLaunchNotification = null;
        }
    }
}
