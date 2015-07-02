package com.push.plugin;

        import android.app.Application;
        import org.apache.cordova.core.ParsePlugin;

public class App extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        ParsePlugin.initializeParseWithApplication(this);
    }

}