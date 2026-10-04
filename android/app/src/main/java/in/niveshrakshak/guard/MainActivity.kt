package `in`.niveshrakshak.guard

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.webkit.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayInputStream

/** The native bridge is attached only to bundled local assets. Remote pages never load here. */
class MainActivity : Activity() {
    private lateinit var web: WebView
    private var shared = ""
    private var chooser: ValueCallback<Array<Uri>>? = null
    private val host = "local.nivesh.invalid"
    private val files = setOf("index.html", "style.css", "app.mjs", "core.mjs", "vault.mjs", "favicon.svg")
    private val externalHosts = setOf("investor.sebi.gov.in", "www.sebi.gov.in", "siportal.sebi.gov.in", "www.cybercrime.gov.in")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (intent.action == Intent.ACTION_SEND) shared = LocalCapture.redact(intent.getStringExtra(Intent.EXTRA_TEXT).orEmpty())
        web = WebView(this); setContentView(web)
        web.setOnApplyWindowInsetsListener { view, insets ->
            if (android.os.Build.VERSION.SDK_INT >= 30) {
                val bars = insets.getInsets(android.view.WindowInsets.Type.systemBars())
                view.setPadding(bars.left, bars.top, bars.right, bars.bottom)
            } else {
                @Suppress("DEPRECATION")
                view.setPadding(insets.systemWindowInsetLeft, insets.systemWindowInsetTop, insets.systemWindowInsetRight, insets.systemWindowInsetBottom)
            }
            insets
        }
        web.settings.javaScriptEnabled = true; web.settings.domStorageEnabled = true
        web.settings.allowFileAccess = false; web.settings.allowContentAccess = false
        web.settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
        web.addJavascriptInterface(Bridge(), "NativeGuard")
        web.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                val u = request?.url ?: return null
                if (u.scheme != "https" || u.host != host) return WebResourceResponse("text/plain", "utf-8", ByteArrayInputStream(ByteArray(0)))
                val file = u.path.orEmpty().removePrefix("/").ifBlank { "index.html" }
                if (file !in files) return WebResourceResponse("text/plain", "utf-8", ByteArrayInputStream(ByteArray(0)))
                val mime = when { file.endsWith(".css") -> "text/css"; file.endsWith(".mjs") -> "application/javascript"; file.endsWith(".svg") -> "image/svg+xml"; else -> "text/html" }
                return WebResourceResponse(mime, "utf-8", assets.open("web/$file"))
            }
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val u = request?.url ?: return true
                if (u.host == host && u.scheme == "https") return false
                if (u.scheme == "https" && u.host in externalHosts && request?.hasGesture() == true) startActivity(Intent(Intent.ACTION_VIEW, u))
                return true
            }
        }
        web.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(view: WebView?, callback: ValueCallback<Array<Uri>>?, params: FileChooserParams?): Boolean {
                chooser?.onReceiveValue(null); chooser = callback
                startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT).apply { type = "image/*"; addCategory(Intent.CATEGORY_OPENABLE) }, 40)
                return true
            }
        }
        web.loadUrl("https://$host/index.html")
    }
    @Deprecated("Platform callback retained without extra dependencies")
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == 40) { chooser?.onReceiveValue(if (resultCode == RESULT_OK && data?.data != null) arrayOf(data.data!!) else null); chooser = null }
    }
    override fun onDestroy() { chooser?.onReceiveValue(null); web.removeJavascriptInterface("NativeGuard"); web.destroy(); super.onDestroy() }
    inner class Bridge {
        @JavascriptInterface fun capabilities(): String {
            val p = LocalCapture.prefs(this@MainActivity)
            val enabled = Settings.Secure.getString(contentResolver, "enabled_notification_listeners").orEmpty().split(":").any { android.content.ComponentName.unflattenFromString(it)?.packageName == packageName }
            return JSONObject().put("android", true).put("access", enabled).put("connected", p.getBoolean("connected", false)).put("paused", LocalCapture.paused(this@MainActivity)).put("allowed", JSONArray(LocalCapture.allowed(this@MainActivity).toList())).put("capture", p.getString("capture", "no-readable-preview")).put("alerts", p.getBoolean("alerts", false)).put("queueCount", LocalCapture.read(this@MainActivity).length()).toString()
        }
        @JavascriptInterface fun sharedText(): String { val s = shared; shared = ""; return s }
        @JavascriptInterface fun inbox(): String = LocalCapture.read(this@MainActivity).toString()
        @JavascriptInterface fun configure(whatsapp: Boolean, telegram: Boolean, paused: Boolean) {
            LocalCapture.setAllowed(this@MainActivity, buildSet { if (whatsapp) add("com.whatsapp"); if (telegram) add("org.telegram.messenger") })
            LocalCapture.prefs(this@MainActivity).edit().putBoolean("paused", paused).commit()
            if (paused) getSystemService(android.app.NotificationManager::class.java).cancel(10)
        }
        @JavascriptInterface fun clearCapture() { LocalCapture.clear(this@MainActivity) }
        @JavascriptInterface fun setAlerts(enabled: Boolean) { runOnUiThread {
            LocalCapture.prefs(this@MainActivity).edit().putBoolean("alerts", enabled).commit()
            if (enabled && android.os.Build.VERSION.SDK_INT >= 33) requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS), 41)
            if (!enabled) getSystemService(android.app.NotificationManager::class.java).cancel(10)
        } }
        @JavascriptInterface fun requestAccess() { runOnUiThread {
            AlertDialog.Builder(this@MainActivity).setTitle("Notification access / सूचना अनुमति")
                .setMessage("Android grants broad notification access. Our app filter processes only readable previews from your selected apps. Hidden content and OTPs stay inaccessible. You can pause or revoke access. Android सभी सूचनाओं की अनुमति देता है। ऐप केवल चुने ऐप के पढ़ने योग्य निवेश संदेश जाँचता है।")
                .setNegativeButton("Cancel / रद्द", null).setPositiveButton("Open settings / सेटिंग खोलें") { _, _ -> startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }.show()
        } }
    }
}
