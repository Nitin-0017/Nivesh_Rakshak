## Latest input fixes

Browser OCR uses bundled Tesseract.js and English/Hindi language data; images stay local. Public HTTPS link content is fetched by /api/read-link with DNS-pinned public-address checks, redirect revalidation, timeout and response-size bounds. Private/login/JavaScript-only pages are unsupported. Voice merges duplicate overlapping multiword result segments, while retaining repeats inside an utterance. 59 tests pass; actual browser OCR recovered the sample withdrawal-fee text without typing and started AI analysis. Real microphone audio has not been exercised in this environment.

## Latest: AI failure fallback

On an AI loading/inference error or a 180-second timeout, the existing rule engine supplies the displayed score with an explicit Rules-based fallback label. Speech and exports preserve the source. Cancellation, pause, and ambiguous model output do not silently substitute scores. Neither score is a fraud probability or official verification. 56 automated tests pass.

## Current scoring behavior

“Check this offer” automatically runs the browser ML model. The visible score comes only from model pattern support, never rule points. Unavailable or ambiguous results show no number. This experimental index is not a fraud probability; live official verification remains pending. First use downloads about 250 MB.

## Latest AI/NLP and voice upgrade

See [AI_NLP_NOTES.md](AI_NLP_NOTES.md) and [GITHUB_SETUP.md](GITHUB_SETUP.md) for current implementation, setup and limits. The app now includes automatic local pretrained ML scoring and voice input. Earlier sections below describe prior stages.

## Authentication update — 4 October 2026

Clerk email/password sign-up, sign-in and Google OAuth are connected using a development instance. The dashboard initializes only after a valid Clerk client session. This is a static client application, not server-side API authorization. Saved browser cases are namespaced by Clerk user ID; old anonymous cases are not imported automatically. Sign-out clears the displayed session by navigation. Case data is not synced or sent to Clerk. Clerk receives authentication data. Production Clerk/Google configuration is still required for a production launch.

# Nivesh Rakshak prototype

A mobile-friendly investment identity and journey guard. This is an interactive prototype, not a production detector or investment-safety guarantee. The website is the working demonstration. The Android project contains native capture source but has not been compiled or device-tested in this environment.

## Run locally

Prerequisites: Python 3 for the static server; Node.js 22+ for tests. Run npm ci and npm run build; no AI API key is required.

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open `http://127.0.0.1:4173`. Use an HTTP server rather than opening the HTML file directly. Browser modules and secure-context APIs need localhost or HTTPS.

```sh
node --test tests/*.test.mjs
node --check dist/app.mjs
node --check dist/core.mjs
node --check dist/vault.mjs
```

Run `npm run build` before deploying the `dist/` directory as static assets. The Sites manifest identifies the registered project and deployment directory. Publishing does not upload messages or case data.

## Four-minute demo

1. Select **Copied registration**, then **Check this offer**. Explain the DEMO label: Sampurna Example Investments and DEMO-REG-001 are fictional. Show the supported sample record alongside a mismatching handle and unverified offer/payment.
2. Add the sample portal invitation. Open Evidence and show the complete deceptive hostname. A name appearing inside a different hostname does not prove association.
3. Add the withdrawal demand. Show the strong warning and the contradiction with the earlier no-fee claim. The timeline contains only supplied events. It never invents an earlier payment or deposit.
4. Open **Find official contact**. The demo contact ends in `.example` and must not be contacted. Change source state to stale/unavailable and repeat: the contact becomes incomplete and the app gives a manual official route.
5. Show Next steps and record a response. The response stays user-reported and never turns the offer into a verified fact.
6. Correct an event or unlink it into a separate case. Findings recompute. Try the education example and the source-unavailable example.
7. Repeat the main path in Hindi. Speech starts only on a user tap and falls back to text when a matching voice is unavailable.
8. Export selected evidence, delete a case and show the Privacy controls. Do not use real scam payments or personal financial information.

## Working and conditional capabilities

| Requirement | Status and boundary |
|---|---|
| Home, cases/search, identity, evidence, timeline, next steps, settings | Working connected web screens |
| Messages, links, claims and handles | Real local analysis. Handles are extracted, but real association needs independent evidence |
| Three scam mechanics | Versioned pattern rules and synthetic registration/domain examples |
| Four independent identity checks and payment check | Working separate supported/mismatch/unverified states |
| Trust-Chain Break Protocol / Verification Debt | Next check selected from available evidence; mismatches and unfinished checks counted separately |
| Contradiction Engine | No-fee promise versus later release-payment request, only within an explicitly linked case |
| Conservative event linkage | User confirms a relationship or supplies an exact case reference. Names/public registration numbers alone do not merge cases |
| Correct, unlink, remove, delete, selected export | Working web controls |
| English / Hindi | Full translated main journey, warnings and next actions. Language quality still needs user testing |
| Independent Verification Bridge | Working sample contact and real official manual fallback. Live entity contact retrieval is not connected |
| Evidence provenance | Message span, rule/version, processing date, fixture date and limitations shown |
| Local-first consent | No remote analysis, analytics or remote case database. Session-only by default |
| Protected saved cases | Optional AES-256-GCM browser vault with a non-extractable CryptoKey in IndexedDB |
| Screenshot | Local selected-image preview. Browser TextDetector OCR only where available; explicit editable text fallback elsewhere |
| Listen | Browser-installed voice, user-tapped only; unavailable-voice fallback |
| Android share / optional NotificationListenerService | Native source included; SDK/build/emulator/device checks pending |
| Native alerts / encrypted intake queue | Source included. Permission, lifecycle and delivery need device testing |
| Live official registry, domain, app or handle lookup | Not connected. No invented API or prohibited scraping. Real input remains unverified |
| Cloud AI / FastAPI / remote persistence | Deliberately absent: the core works without them and no private data leaves the device |
| Deepfake scanner / dedicated tip-group profiler | Outside the three-pattern first scope |

## Data flow and source contracts

`selected input → in-memory redaction → relevance check → exact claim spans → versioned rules → separate evidence checks → case findings → independent next action`

- A user message is a claim source, never an official verification source.
- Fixtures are usable only for labelled synthetic events. Editing an example makes it real input and disables fixture-based verification for that case.
- The registration adapter matches DEMO-REG-001 exactly. Exact names match separately. A sample claiming a banking licence contradicts the sample category. No-match differs from source outage. Stale records stay unverified.
- Domain matching uses parsed, lower-case, IDN-normalised hostnames, with only the exact reference host and its explicit `www` form. Matching a domain alone cannot authenticate the sender or offer.
- Official registration, apps/handles and contacts: SEBI investor-support manual route. Matching rule for a future adapter must be exact identifier with a permitted independent reference, retrieval date and freshness policy. Until implemented, unavailable means unverified.
- Payment: SEBI Check manual route for relevant recipient identifiers. It cannot verify whether an exact fee demand is authorised.
- Official links reviewed 4 October 2026. This date is not a live registry-check timestamp. Third-party pages can change.

References:

- https://investor.sebi.gov.in/Investor-support.html
- https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes
- https://siportal.sebi.gov.in/intermediary/sebi-check
- https://www.cybercrime.gov.in/
- https://developer.android.com/about/versions/15/behavior-changes-all

## Privacy and ownership

Case text is held in memory until the user explicitly enables saved cases. The browser vault encrypts redacted cases and reported responses using AES-GCM with random IVs. The encryption key is non-extractable and stored in the same browser's IndexedDB. This is **not account authentication** and cannot protect against an unlocked browser, compromised origin or device. There is no server case API and thus no cross-account remote case access to claim as tested.

Retention is 1, 7 or 30 days of case inactivity. Expiry runs when the app is opened and periodically while it is open. Delete-all clears the vault ciphertext and key, plus the native intake queue when running inside Android. Downloads already exported are outside deletion control. Session-only cases disappear when the page closes or reloads. Turning saved storage off removes the saved vault but retains the current session.

Sensitive patterns are removed before case creation: common OTP/password/token/account/card/phone formats and URL credentials/query/fragment. This filter is intentionally limited and can miss unusual secrets. Review the input. No suspicious URL is fetched, no scripts from messages execute, no APK is installed, and no external contact/report/payment is triggered automatically. External official links open only on user action. No raw private content is logged.

## Android build and installation

No Android SDK, Gradle executable, Android Studio, emulator or device was available here. **There is no tested APK in this package.** Use Android Studio with JDK 17, SDK platform 35 and Gradle 8.11.1. Open `android/` and sync its pinned AGP 8.9.2 / Kotlin 2.1.20 configuration. If a Gradle executable is available:

```sh
cd android
gradle wrapper --gradle-version 8.11.1
./gradlew :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

The preBuild task copies `dist/` into bundled Android assets. The Kotlin shell uses the same local UI rather than duplicating it in Compose. It serves only an allowlisted set of local assets over a virtual HTTPS origin and attaches a bridge only there. It never loads suspicious remote pages in the bridged WebView. Official resource links use the external browser.

Share an investment text into the app using Android's share menu. Native privacy intake appears at the bottom of Privacy when the bridge is present. Select WhatsApp and/or Telegram, save choices, then manage system notification access. Capture is paused by default. Granting Android access is broad; the app allowlist is a product filter, not a narrower OS grant. Enable generic alerts through their separate permission. Use **Review captured items** to turn a preview into a separate case. There is no automatic case merging.

The queue uses AES-GCM with an Android Keystore key. It retains at most 50 relevant redacted previews, expires them after seven days when accessed and removes excluded-app items. Sensitive keyword-containing notifications are dropped conservatively. Notifications may be absent, truncated or redacted. No SMS, accessibility scraping, call logs, chat history or hidden previews are read. Generic warning alerts include no excerpt and open the app; delivery is not guaranteed.

### Controlled notification replay

The website's clearly labelled sample buttons provide the deterministic simulator. Native capture needs a genuine controlled notification from a selected test app on an emulator/device. Do not treat web sample replay as proof of notification capture. Do not send real payments or use private chat history.

Native pending checks: compile/install, text share, image picker, absent/hidden previews, Android 15 OTP redaction, repeated/updated notifications, groups, listener reconnect, allowlist, pause, revocation, alert permission denied/granted, encrypted queue expiry/deletion, background/force-stop, large Hindi text and WebView voice/storage support.

## Limitations before submission

This prototype can demonstrate a complete verification journey. It does not establish real-world loss prevention, unique detection superiority or production readiness. Official access contracts, live-source integration, Android hardware checks, independent holdout data, language usability, load/cost evaluation and privacy/security review remain necessary. The hackathon submission still needs a 3–5 minute scenario video alongside a working accessible link and PPT. The default hosted Site is private; judges need authorised access or a user-requested public sharing change.

## Risk signal score
The results screen includes a 0–100 heuristic concern index, version nr-concern-1.0. Weights: release-payment demand 60, later contradictory fee 15, guaranteed-return wording 25, domain mismatch 40 or handle mismatch 20 (maximum of this identity group), link concern 10, app installation 15. Each group contributes once per case. Sum capped at 100. The expandable explanation shows contributing signals. Unknown verification adds no points, and zero never means safe. Demo comparisons use fictional reference evidence. Weights are prototype choices, not calibrated fraud probabilities or a dedicated tip-group profiler. English/Hindi supported.
