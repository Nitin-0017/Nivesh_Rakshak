# Nivesh Rakshak

### Check before you invest.

Nivesh Rakshak is an investment-safety web prototype that helps users understand suspicious financial messages, identify warning patterns, and find an independent verification step before sending money.

Built by **Team Chakravyuh** for **Sangyan Investor Resilience Hackathon — Track A: Digital Fraud & Scam Resilience**.

🌐 **Live prototype:** https://nivesh-rakshak.vercel.app/

> **Prototype status:** Live official registration and contact verification are pending. Model scores are experimental concern signals, not confirmed fraud percentages or investment-safety guarantees.

---

## The Problem

Investment scams often begin with convincing details:

- A genuine or fabricated registration number
- A familiar institution’s name
- A cloned investment website or app
- Guaranteed-return claims
- Coordinated WhatsApp or Telegram stock tips
- Additional payments demanded before withdrawals

A genuine registration number does not prove that a sender, website, exact offer, or payment demand belongs to the registered institution.

First-time investors may struggle to understand these relationships or know where to verify them independently.

## Our Approach

Nivesh Rakshak follows a simple journey:

**Submit an offer → Review warning patterns → Understand the concern → Verify independently**

The prototype keeps registration, sender association, exact offer, and payment checks separate. Missing evidence remains unverified.

### Intended Users

- First-time and retail investors
- Users from Tier-2 and Tier-3 Indian cities
- People more comfortable with Hindi or simple English
- Users who prefer voice input or screenshots over typing

These are intended user groups, not evidence of completed field research.

---

## Working Features

### Message Analysis

Paste an investment-related message and check it for concerning patterns.

### Voice Input

Use the microphone to dictate a message in Hindi or English.

- Interim speech appears in the text box.
- Overlapping repeated multiword result segments are merged.
- Users can stop recording and review or correct the transcript.
- Browser support and microphone permission are required.
- Audio may be processed by the browser’s speech provider.

### Screenshot OCR

Upload a PNG, JPEG, or WebP screenshot up to 5 MB.

Tesseract reads Hindi and English text locally in the browser. Users can review the extracted text before analysis.

The screenshot is not uploaded for OCR or saved as a case attachment.

### Public Link Reading

Submit an eligible public HTTPS page without typing an additional message.

A server endpoint retrieves readable page text and passes it into the analysis flow.

Current restrictions:

- HTTPS only
- No embedded credentials
- No query parameters or fragments
- Public network addresses only
- Limited redirects, response size, and response time

Private, login-required, blocked, or JavaScript-only pages may not be readable.

Retrieved website content is treated as an unverified claim.

### Multilingual AI Analysis

A pretrained multilingual MiniLM NLI model compares message meaning against six hypotheses:

1. Payment demanded before releasing funds
2. Guaranteed investment profits
3. Urgent pressure to pay
4. Coordinated stock purchases
5. App installation or device-access requests
6. Education about avoiding financial scams

The model runs in a browser worker using Transformers.js and ONNX/WASM.

### Context and Uncertainty Handling

Score, heading, and explanation share a common interpretation policy.

Weak, ambiguous, educational, invalid, or partially analysed results do not force a numeric model score.

A conservative text-context check helps distinguish explicit educational warnings from investment solicitations.

### Rules-Based Fallback

If model loading or inference fails, or reaches its timeout, the existing rule engine supplies a clearly labelled fallback result.

An ambiguous model result is not treated as a model failure.

### Clear Explanations

Results explain the detected pattern and provide practical verification guidance in simple language.

Explanations use predefined category guidance. They are not unrestricted LLM-generated answers.

### Separate Evidence Checks

The prototype separately displays:

- Registration record
- Entity-name match
- Sender, domain, or handle association
- Exact offer
- Payment demand

Available demonstration registry records are fictional and labelled accordingly.

### Case Management

Users can:

- Add related evidence
- Review an evidence timeline
- Correct text
- Unlink evidence into a separate case
- Save cases for the session
- Export selected evidence
- Delete cases

### Hindi and English Interface

A globe icon switches the interface language.

The app also offers user-triggered read-aloud results when supported by available browser voices.

### Optional Encrypted Browser Storage

Users can enable an encrypted browser vault to retain cases.

Case storage is local to the browser and separated by the signed-in account. Cases are not synchronised to a remote database.

---

## Understanding the Score

The visible model score is an **experimental pattern-support index**.

For a qualifying model result, the strongest concerning-pattern support is multiplied by 100 and rounded.

A score of 99 does **not** mean:

- 99% probability of fraud
- 99% detection accuracy
- Official confirmation of a scam
- Verification of the sender or institution

A low score does not establish safety.

A numeric model score is withheld when the result is weak, ambiguous, educational, invalid, or based on incomplete input coverage.

The rules-based fallback score uses separate warning rules and is explicitly labelled.

---

## Technology Stack

| Component | Current implementation |
|---|---|
| Web interface | HTML, CSS, JavaScript ES modules |
| Authentication | Clerk |
| Model inference | Transformers.js |
| Model | Pretrained multilingual MiniLM NLI |
| Inference runtime | ONNX / WASM |
| Screenshot OCR | Tesseract.js with English and Hindi data |
| Voice input | Browser SpeechRecognition API |
| Read-aloud results | Browser SpeechSynthesis API |
| Link-reading backend | Node.js Vercel function |
| HTML parsing | linkedom |
| Network-address validation | ipaddr.js |
| Optional case storage | Encrypted browser vault |
| Deployment | Vercel |
| Tests | Node.js built-in test runner |

### Model Details

- Model: `onnx-community/multilingual-MiniLMv2-L6-mnli-xnli-ONNX`
- Pinned revision: `ca5daf3d11b6c4b3143b1f4602a2edfb64c3ad7e`
- Runtime configuration: FP16 inference with single-thread WASM
- Maximum analysed input: 200 model tokens from the first 6,000 characters
- First-use download: approximately 250 MB of model, tokenizer, and runtime assets

The model is pretrained. This project has not trained or validated a dedicated Indian financial-fraud model.

---

## Architecture

```text
User-selected input
        |
        +-- Pasted message
        +-- Voice transcript
        +-- Screenshot -> local OCR
        +-- Public HTTPS link -> server text retrieval
        |
Input validation and sensitive-pattern redaction
        |
Multilingual tokenization and model analysis
        |
Shared context and interpretation policy
        |
Model result OR explicitly labelled rules fallback
        |
Separate evidence checks
        |
Explanation and independent verification guidance
        |
User-controlled case correction, export, storage or deletion
```

Official verification states are not inferred from model scores.

---

## Project Structure

```text
nivesh-rakshak/
├── src/
│   └── ml/
│       ├── classifier.mjs
│       ├── decision.mjs
│       └── worker.mjs
├── dist/
│   ├── index.html
│   ├── app.mjs
│   ├── core.mjs
│   ├── voice.mjs
│   ├── ocr.mjs
│   ├── ml-ui.mjs
│   ├── model-score.mjs
│   ├── vault.mjs
│   ├── login.html
│   ├── auth.mjs
│   ├── style.css
│   └── vendor/
├── api/
│   └── read-link.mjs
├── lib/
│   └── link-reader.mjs
├── scripts/
│   ├── build-auth.mjs
│   ├── build-ml.mjs
│   ├── build-ocr.mjs
│   └── evaluate-ml.mjs
├── tests/
├── android/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── vercel.json
├── GITHUB_SETUP.md
├── AI_NLP_NOTES.md
├── TEST_REPORT.md
└── THIRD_PARTY_NOTICES.md
```

This project retains its original static web-app layout. Authored UI code lives in `dist/`; authored model code lives in `src/ml/`.

Some files in `dist/` are generated during the build.

The `android/` directory contains earlier companion-project source. It is not required to run the web app and has not been device-validated.

---

## Installation

### Requirements

- Node.js 22 or newer
- npm
- Internet access for authentication and initial asset downloads
- A Clerk application for an independent deployment
- Python 3 only if using the static preview server

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd YOUR_REPOSITORY_FOLDER
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Configure Authentication

```bash
cp .env.example .env.local
```

Set your Clerk publishable key in `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
```

Enable the desired authentication methods in Clerk and configure the appropriate application domains.

Never commit secret keys or `.env.local`.

### 4. Build

```bash
npm run build
```

The build prepares authentication configuration, browser inference assets, and OCR assets.

### 5. Run Tests

```bash
npm test
```

---

## Running Locally

### Complete Web and API Flow

Use the Vercel CLI development environment:

```bash
npx vercel dev
```

Follow the CLI setup and open the localhost URL it prints.

The source archive excludes the original Vercel project’s credentials and linking configuration. Link your own project when required.

### Static UI Preview

```bash
npm run serve
```

Open:

```text
http://127.0.0.1:4173/
```

The Python static server does not run Vercel API functions. Public-link content retrieval will not work in this preview.

---

## Deploying on Vercel

1. Push the source to your GitHub repository.
2. Import the repository into Vercel.
3. Configure `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`.
4. Configure Clerk authentication methods and deployment domains.
5. Deploy using the settings in `vercel.json`.

The project uses:

- Install command: `npm ci`
- Build command: `npm run build`
- Static output directory: `dist`
- Link-reading function: `api/read-link.mjs`

For an independent public release, complete production authentication configuration.

---

## Demo Examples

All examples below are fictional.

### Withdrawal-Fee Demand

```text
Your investment profit is ready. Pay a verification fee of ₹5,000 now to unlock your withdrawal.
```

Expected concern: payment demanded before funds are released.

### Guaranteed Returns

```text
Invest ₹10,000 today and earn guaranteed 30% profit every week. Your money is completely risk-free. Send payment now.
```

Expected concerns: guaranteed-profit wording and payment pressure.

### Coordinated Stock Buying

```text
Join our Telegram investment group. All members must buy the same stock tomorrow morning so its price rises. Sell after new investors join.
```

Expected concern: coordinated stock-tip promotion.

### Educational Warning

```text
Investor education: guaranteed returns can be a scam warning. Always verify the investment firm independently. Do not pay a fee to unlock withdrawals.
```

Expected interpretation: educational warning rather than an investment promise.

### Hindi Example

```text
हमारे निवेश प्लान में दस हजार रुपये लगाइए और हर हफ्ते पक्का मुनाफा पाइए। पैसे निकालने के लिए पहले दो हजार रुपये शुल्क जमा करें।
```

Model output can vary. Evaluate whether the explanation fits the message and preserves uncertainty, rather than expecting a fixed numeric score.

---

## Privacy and Security

- Messages and screenshot OCR are processed in the browser.
- Public links are retrieved by the server.
- Voice recognition may transmit audio to the browser’s speech provider.
- Clerk handles account authentication.
- Case content is not sent to Clerk.
- Common sensitive patterns are redacted before case creation.
- Redaction is best effort and can miss unusual secrets.
- Optional case storage uses an encrypted browser vault.
- Users control case export and deletion.
- Model files are cached separately from cases.

The link reader validates public network addresses, pins the connection to a validated address, revalidates redirects, and limits response time and size.

These safeguards do not constitute a completed production security audit.

Browser encryption does not protect against someone with access to a compromised browser or device. Exported files are outside the app’s deletion controls.

---

## Testing

The latest source package passes **62 automated tests**.

Coverage includes:

- Investment warning rules
- Educational and ambiguous-message interpretation
- Consistency between model scores and explanations
- Explicit rules-based fallback
- Voice transcript revisions and overlapping segments
- Public-address and URL validation
- Encrypted browser storage
- Evidence and identity-check separation

An actual browser smoke test verified screenshot OCR followed by model analysis. The deployed link-reading endpoint was also checked.

Passing these tests does not establish real-world fraud-detection accuracy, loss prevention, or complete production readiness.

See `TEST_REPORT.md` for details and limitations.

---

## Current Limitations

- Live official registration and contact verification are pending.
- Registry demonstration records are fictional.
- PDF/DOCX upload is not implemented.
- The web app cannot inspect installed apps or read private WhatsApp/Telegram chats.
- There is no dedicated malware or deepfake detector.
- OCR and voice transcription can make errors.
- Model analysis has a bounded input window.
- The model is not trained specifically for Indian investment fraud.
- First-use model download is large.
- Low-bandwidth and low-end-device performance have not been comprehensively validated.
- Private, blocked, login-required, and JavaScript-only pages may not be readable.
- There is no cloud case synchronisation.
- Authentication and security require further work before a production launch.

---

## Production Roadmap

Proposed future work includes:

- PDF/DOCX extraction and scanned-document OCR
- Permitted official-source adapters
- Independently sourced official contact information
- Stronger domain and app-link checks
- A representative, appropriately sourced Indian scam dataset
- Model evaluation by scam category and language
- Calibration where reliable probability estimates are justified
- Regional-language expansion
- Low-bandwidth and affordable-device optimisation
- Server-side access controls for future protected APIs
- Monitoring, versioning, and user pilots

These are proposed capabilities, not implemented features.

---

## Public-Good Guardrails

Nivesh Rakshak is designed for investor protection.

It does not provide:

- Stock tips or buy/sell/hold recommendations
- Price predictions or trading algorithms
- Broker or financial-product promotions
- Automated payments or complaint submissions
- Guaranteed scam detection or recovery
- Authoritative identity verification from AI output alone

A missing warning does not establish that an offer is safe.

---

## Team Chakravyuh

- **Nitin Kumar** — Project Lead
- **Manjeet** — Project Member
- **Kunal Kumar Mandal** — Project Member

---

## Third-Party Software

See `THIRD_PARTY_NOTICES.md` for dependency and asset notices.

## License

A project-wide license has not been declared here. Add a `LICENSE` file if the team chooses to grant reuse rights.

---

**Nivesh Rakshak: understand the concern, check the evidence, and verify independently before paying.**
