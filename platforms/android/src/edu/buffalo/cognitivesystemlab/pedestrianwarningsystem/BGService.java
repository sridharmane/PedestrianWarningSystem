package edu.buffalo.cognitivesystemlab.pedestrianwarningsystem;

import com.red_folder.phonegap.plugin.backgroundservice.BackgroundService;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by Sridhar Mane on 7/2/2015.
 */
public class BGService extends BackgroundService{
    @Override
    protected JSONObject doWork() {
        JSONObject push = new JSONObject();
        return null;
    }

    @Override
    protected JSONObject getConfig() {
        return null;
    }

    @Override
    protected void setConfig(JSONObject config) {
//        return null;
    }

    @Override
    protected JSONObject initialiseLatestResult() {
        return null;
    }
}
