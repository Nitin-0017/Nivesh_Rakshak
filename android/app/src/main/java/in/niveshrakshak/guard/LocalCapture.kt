package `in`.niveshrakshak.guard

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import org.json.JSONArray
import org.json.JSONObject
import java.security.KeyStore
import java.security.MessageDigest
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/** Queue only redacted, permitted notifications. Never upload or log raw content. */
object LocalCapture {
    private const val ALIAS = "nr-capture-v1"
    private val supported = setOf("com.whatsapp", "org.telegram.messenger")
    fun prefs(c: Context) = c.getSharedPreferences("nr-capture", Context.MODE_PRIVATE)
    fun allowed(c: Context) = prefs(c).getStringSet("allowed", emptySet())!!.intersect(supported)
    fun setAllowed(c: Context, values: Set<String>) { prefs(c).edit().putStringSet("allowed", values.intersect(supported)).commit() }
    fun paused(c: Context) = prefs(c).getBoolean("paused", true)
    fun redact(raw: String): String {
        if (Regex("(?i)\\b(otp|one.time.password|password|passcode|cvv|pin)\\b|ओटीपी|पासवर्ड|पिन").containsMatchIn(raw)) return ""
        var text = raw.take(10000)
        text = text.replace(Regex("\\b(?:\\d[ -]?){12,19}\\b"), "[financial identifier removed]")
            .replace(Regex("(?:\\+?91[ -]?)?\\b[6-9]\\d{9}\\b"), "[phone removed]")
            .replace(Regex("(?i)(account|acct|a/c)\\s*(number|no\\.?)?\\s*[:=]?\\s*[A-Za-z0-9-]{5,30}"), "[account removed]")
            .replace(Regex("(?i)(access.token|api.key|bearer)\\s*[:=]?\\s*\\S+"), "[secret removed]")
        text = text.replace(Regex("https?://[^\\s<>]+")) { m -> try { val uri = android.net.Uri.parse(m.value); "${uri.scheme}://${uri.host}${uri.path.orEmpty()}" } catch (_: Exception) { "[link unavailable]" } }
        return if (Regex("(?i)invest|broker|withdraw|profit|sebi|trading|registration|निवेश|निकासी|लाभ|मुनाफा|पंजीकरण").containsMatchIn(text)) text else ""
    }
    private fun key(): SecretKey {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        (ks.getKey(ALIAS, null) as? SecretKey)?.let { return it }
        return KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore").apply {
            init(KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build())
        }.generateKey()
    }
    @Synchronized fun read(c: Context): JSONArray = try {
        val blob = prefs(c).getString("queue", null)
        if (blob == null) JSONArray() else {
            val parts = blob.split(":")
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, key(), GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)))
            val all = JSONArray(String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), Charsets.UTF_8))
            val kept = JSONArray(); val cutoff = System.currentTimeMillis() - 7L * 86400000
            for (i in 0 until all.length()) if (all.getJSONObject(i).optLong("time") > cutoff && all.getJSONObject(i).optString("app") in allowed(c)) kept.put(all.getJSONObject(i))
            if (kept.length() != all.length()) write(c, kept)
            kept
        }
    } catch (_: Exception) { JSONArray() }
    private fun write(c: Context, rows: JSONArray) {
        val cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key())
        val body = cipher.doFinal(rows.toString().toByteArray(Charsets.UTF_8))
        prefs(c).edit().putString("queue", Base64.encodeToString(cipher.iv, Base64.NO_WRAP) + ":" + Base64.encodeToString(body, Base64.NO_WRAP)).commit()
    }
    @Synchronized fun add(c: Context, packageName: String, text: String, notificationKey: String): Boolean {
        if (paused(c) || packageName !in allowed(c)) return false
        val safe = redact(text); if (safe.isBlank()) return false
        val digest = MessageDigest.getInstance("SHA-256").digest(safe.toByteArray()).joinToString("") { "%02x".format(it) }
        val old = read(c); val rows = JSONArray()
        for (i in 0 until old.length()) { val r = old.getJSONObject(i); if (r.optString("hash") == digest) return false; if (r.optString("notificationKey") != notificationKey) rows.put(r) }
        while (rows.length() >= 50) rows.remove(0)
        rows.put(JSONObject().put("id", java.util.UUID.randomUUID().toString()).put("text", safe).put("app", packageName).put("time", System.currentTimeMillis()).put("hash", digest).put("notificationKey", notificationKey))
        write(c, rows)
        return true
    }
    @Synchronized fun clear(c: Context) {
        prefs(c).edit().remove("queue").commit()
        KeyStore.getInstance("AndroidKeyStore").apply { load(null); if (containsAlias(ALIAS)) deleteEntry(ALIAS) }
    }
}
