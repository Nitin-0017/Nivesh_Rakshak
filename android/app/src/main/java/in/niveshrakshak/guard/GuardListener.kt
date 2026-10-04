package `in`.niveshrakshak.guard

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class GuardListener : NotificationListenerService() {
    override fun onListenerConnected() { LocalCapture.prefs(this).edit().putBoolean("connected", true).apply() }
    override fun onListenerDisconnected() { LocalCapture.prefs(this).edit().putBoolean("connected", false).apply() }
    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (LocalCapture.paused(this) || sbn.packageName !in LocalCapture.allowed(this)) return
        if (sbn.notification.flags and Notification.FLAG_GROUP_SUMMARY != 0) return
        val extras = sbn.notification.extras
        val text = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString()
            ?: extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()
        if (text.isNullOrBlank()) { LocalCapture.prefs(this).edit().putString("capture", "no-readable-preview").apply(); return }
        try {
            val added = LocalCapture.add(this, sbn.packageName, text, sbn.key)
            LocalCapture.prefs(this).edit().putString("capture", "preview-processed").apply()
            val safe = LocalCapture.redact(text)
            if (added && LocalCapture.prefs(this).getBoolean("alerts", false) &&
                !Regex("(?i)education|beware|do not pay|never pay|सावधान|न दें").containsMatchIn(safe) &&
                Regex("(?i)pay|payment|fee|शुल्क|जमा").containsMatchIn(safe) && Regex("(?i)withdraw|unlock|release|निकासी").containsMatchIn(safe)) {
                if (android.os.Build.VERSION.SDK_INT >= 33 && checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) return
                val nm = getSystemService(android.app.NotificationManager::class.java)
                nm.createNotificationChannel(android.app.NotificationChannel("nr-concerns", "Verification concerns / जाँच संकेत", android.app.NotificationManager.IMPORTANCE_DEFAULT))
                val intent = android.content.Intent(this, MainActivity::class.java).addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TOP)
                val pending = android.app.PendingIntent.getActivity(this, 1, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE)
                nm.notify(10, android.app.Notification.Builder(this, "nr-concerns").setSmallIcon(android.R.drawable.ic_dialog_alert)
                    .setContentTitle("Review an investment message / निवेश संदेश जाँचें")
                    .setContentText("Open Nivesh Rakshak to verify. No payment action has been taken.")
                    .setVisibility(android.app.Notification.VISIBILITY_PRIVATE).setContentIntent(pending).setAutoCancel(true).build())
            }
        } catch (_: Exception) { LocalCapture.prefs(this).edit().putString("capture", "storage-unavailable").apply() }
    }
}
