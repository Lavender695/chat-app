package com.chatapp;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private static final int CAMERA_PERMISSION_CODE = 100;
    private static final int RECORD_AUDIO_PERMISSION_CODE = 101;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webview);

        // 设置WebView设置
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // 添加JavaScript接口
        webView.addJavascriptInterface(new AndroidInterface(this), "Android");

        // 设置WebChromeClient以处理权限请求
        webView.setWebChromeClient(new WebChromeClient());

        // 加载Web应用
        // 注意：在实际应用中，应该使用HTTPS并确保来源安全
        webView.loadUrl("http://10.0.2.2:5173"); // 10.0.2.2是Android模拟器访问本地主机的地址
    }

    // 原生方法接口
    public class AndroidInterface {
        Context mContext;

        AndroidInterface(Context c) {
            mContext = c;
        }

        // 获取设备信息
        @JavascriptInterface
        public String getDeviceInfo() {
            String deviceInfo = "设备型号: " + android.os.Build.MODEL + "\n" +
                    "Android版本: " + android.os.Build.VERSION.RELEASE + "\n" +
                    "制造商: " + android.os.Build.MANUFACTURER;
            
            runOnUiThread(() -> {
                Toast.makeText(mContext, deviceInfo, Toast.LENGTH_LONG).show();
            });
            
            return deviceInfo;
        }

        // 请求摄像头权限
        @JavascriptInterface
        public void requestCameraPermission() {
            runOnUiThread(() -> {
                if (ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions((Activity) mContext, new String[]{android.Manifest.permission.CAMERA}, CAMERA_PERMISSION_CODE);
                } else {
                    Toast.makeText(mContext, "摄像头权限已授予", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // 请求麦克风权限
        @JavascriptInterface
        public void requestMicrophonePermission() {
            runOnUiThread(() -> {
                if (ContextCompat.checkSelfPermission(mContext, android.Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions((Activity) mContext, new String[]{android.Manifest.permission.RECORD_AUDIO}, RECORD_AUDIO_PERMISSION_CODE);
                } else {
                    Toast.makeText(mContext, "麦克风权限已授予", Toast.LENGTH_SHORT).show();
                }
            });
        }

        // 发送推送消息
        @JavascriptInterface
        public void showNotification(String title, String message) {
            runOnUiThread(() -> {
                // 创建通知渠道（Android 8.0+ 必需）
                String channelId = "default_channel";
                String channelName = "默认通知渠道";
                NotificationManager notificationManager = (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
                
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    NotificationChannel channel = new NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_DEFAULT);
                    notificationManager.createNotificationChannel(channel);
                }
                
                // 构建通知
                NotificationCompat.Builder builder = new NotificationCompat.Builder(mContext, channelId)
                        .setSmallIcon(R.mipmap.ic_launcher) // 使用应用图标作为通知图标
                        .setContentTitle(title)
                        .setContentText(message)
                        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                        .setAutoCancel(true);
                
                // 显示通知
                notificationManager.notify((int) System.currentTimeMillis(), builder.build());
            });
        }
    }

    // 处理权限请求结果
    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == CAMERA_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "摄像头权限已授予", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "摄像头权限被拒绝", Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == RECORD_AUDIO_PERMISSION_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "麦克风权限已授予", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "麦克风权限被拒绝", Toast.LENGTH_SHORT).show();
            }
        }
    }

    // 处理返回按钮
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}