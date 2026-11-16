# FIREBASE SETUP & DEPLOYMENT GUIDE
## Backend Configuration for IPCR Accomplishment Tracker
**National Irrigation Administration (NIA) - Regional Office XI**

---

## 1. Overview & Cloud Services

The IPCR Accomplishment Tracker relies on Google Firebase to deliver an isolated, private backend environment:

- **Firebase Authentication:** Single-user email and password authentication with disabled self-registration.
- **Cloud Firestore:** Document database configured with strict user-scoped security rules and composite indexes.
- **Firebase Storage:** Private blob storage for PDF evidence, signed documents, memos, and report outputs.
- **Cloud Functions (2nd Gen):** Secure serverless Node.js / Python microservices hosting the Gemini API integration and heavy document compilation logic.
- **Firebase App Check:** Prevents unauthorized API abuse and ensures requests originate solely from the verified web application.

---

## 2. Firebase Project Initialization Steps (To Be Executed in Phase 1)

### Step 1: Create Firebase Project
1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and enter:
   - Project name: `ipcr-nia-ro11` (or your preferred identifier).
3. Disable Google Analytics (optional, for maximum data privacy).
4. Upgrade project to the **Blaze (Pay-as-you-go)** plan (required for Cloud Functions 2nd gen and external Gemini API egress).

### Step 2: Configure Authentication
1. Go to **Authentication** > **Sign-in method**.
2. Enable **Email/Password**.
3. Under **User settings**, verify that account creation is restricted or register the single administrative civil engineer user account manually.
4. Disable third-party identity providers to ensure strict single-user containment.

### Step 3: Initialize Cloud Firestore
1. Navigate to **Firestore Database** > **Create database**.
2. Select database location: `asia-southeast1` (Singapore) for optimal low-latency access from the Philippines (`Asia/Manila`).
3. Start in **Production mode** (all reads and writes denied by default).

### Step 4: Configure Cloud Storage
1. Navigate to **Storage** > **Get started**.
2. Location: Select the same bucket region (`asia-southeast1`).
3. Set default rules to deny public access.

---

## 3. Environment Variables Configuration

Create a `.env.local` file in the project root.

> **CRITICAL SECURITY NOTE:** Never commit `.env` or `.env.local` into version control. These files are already included in `.gitignore`.

```env
# Client-side configuration (safe for public bundle)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Target Timezone & Geographic Defaults
VITE_DEFAULT_TIMEZONE=Asia/Manila
VITE_OFFICE_NAME=NIA Regional Office XI - Planning and Design Section
```

---

## 4. Cloud Functions & Gemini API Secrets

Gemini API calls will be executed exclusively through Firebase Cloud Functions to prevent client credential leakage.

```bash
# Define Gemini API secret in Google Cloud Secret Manager / Firebase CLI
firebase functions:secrets:set GEMINI_API_KEY
```

In Cloud Functions v2 runtime (`functions/src/index.ts`):
```typescript
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const classifyActivity = onCall(
  { secrets: ["GEMINI_API_KEY"], cors: true },
  async (request) => {
    // 1. Authenticate user request
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    
    // 2. Fetch API key securely from environment secret
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    // ... logic for classification
  }
);
```

---

## 5. Security Rules Verification

### Firestore Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null && 
        (resource == null || resource.data.ownerUid == request.auth.uid) &&
        (request.resource == null || request.resource.data.ownerUid == request.auth.uid);
    }
  }
}
```

### Storage Rules (`storage.rules`)
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

