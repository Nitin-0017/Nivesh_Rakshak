plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
    namespace = "in.niveshrakshak.guard"
    compileSdk = 35
    defaultConfig { applicationId = "in.niveshrakshak.guard"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildTypes { getByName("release") { isMinifyEnabled = false } }
}
tasks.register<Copy>("syncWebAssets") { from("../../dist"); into("src/main/assets/web") }
tasks.named("preBuild") { dependsOn("syncWebAssets") }
