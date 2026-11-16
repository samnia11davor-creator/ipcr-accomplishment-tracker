# IPCR Accomplishment Tracker
## Daily Work Monitoring and Automated Accomplishment Reporting System

**Agency:** National Irrigation Administration (NIA), Regional Office XI  
**Section:** Planning and Design Section  
**User Role:** Civil Engineer  
**System Status:** Development (Phase 0 Completed)

---

## 1. Executive Summary

The **IPCR Accomplishment Tracker** is a specialized, private web application engineered to eliminate the manual, error-prone reconstruction of semiannual Individual Performance Commitment and Review (IPCR) accomplishment reports.

By capturing daily activities, technical reviews, project planning deliverables, and document monitoring transactions as they occur, the system automatically correlates daily work logs with approved IPCR targets, aggregates supporting documentary evidence, and synthesizes publication-ready accomplishment reports in Excel, Word, and PDF formats.

---

## 2. Key Modules & Navigation

| # | Module | Purpose |
|---|--------|---------|
| 1 | **Dashboard** | Real-time executive KPIs, commitment progress, pending actions, and monthly activity trends. |
| 2 | **Daily Activities** | Fast, frictionless daily work logger with status tracking, time logging, and project linking. |
| 3 | **Document Monitoring** | Comprehensive digital correspondence and document sheet mirroring NIA's DOC LOG SHEET. |
| 4 | **IPCR Commitments** | Central repository of approved MFO/PAPs, success indicators, targets, and measurement types. |
| 5 | **Accomplishment Monitoring** | Direct correlation matrix comparing daily activities and evidence against approved targets. |
| 6 | **Report Generator** | Multi-period automated engine producing semiannual and quarterly IPCR accomplishment reports. |
| 7 | **Import Data** | Historical workbook ingestion engine for historical IPCR and daily log sheets with validation. |
| 8 | **Backup & Audit** | Double-layer backup management (GitHub source + GCP/Firestore snapshots) with audit logs. |
| 9 | **Settings** | User profile, office designation, reporting period defaults, and application configuration. |

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript (Strict), Vite, Tailwind CSS, Lucide Icons
- **Backend (Phase 1+):** Firebase Authentication, Cloud Firestore, Firebase Cloud Storage, Firebase Cloud Functions (v2), Firebase Hosting
- **AI Processing (Phase 4+):** Google Gemini API via secure Cloud Functions backend
- **Timezone & Locale:** Asia/Manila (PHT, UTC+8), Philippine standard date formatting (`dd/MM/yyyy` or `MMMM d, yyyy`)

---

## 4. Development Roadmap & Phasing

- [x] **Phase 0:** Project Initialization, Modular Directory Structure, Design System, Navigation, and Core Documentation
- [ ] **Phase 1:** Firebase Authentication, Firestore Rules, Cloud Storage, and Git Branching Setup
- [ ] **Phase 2:** Historical Data Import Engine (Workbook parsing for IPCR 2026 & SAM DOC LOG)
- [ ] **Phase 3:** Daily Activity Logger and Document Tracking Modules
- [ ] **Phase 4:** AI-Powered IPCR Commitment Matching & Accomplishment Matrix
- [ ] **Phase 5:** Automated Accomplishment Report Generator (Excel, Word, PDF exports)
- [ ] **Phase 6:** Backup Automation, Soft Deletion, Audit Logs, and Disaster Recovery Verification
- [ ] **Final Phase:** Comprehensive Integration, Security Audit, and User Acceptance Validation

---

## 5. Local Development Setup

### Prerequisites
- Node.js (v20+ or v24+)
- npm (v10+)
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ipcr-accomplishment-tracker.git
cd ipcr-accomplishment-tracker

# Install dependencies
npm install

# Start development server
npm run dev

# Run TypeScript checks
npm run typecheck

# Production build
npm run build
```

---

## 6. Security & Governance Principles

1. **Owner-Only Isolation:** All Firestore documents and storage assets are strictly scoped to the authenticated user ID (`ownerUid`).
2. **Backend-Enforced AI:** Gemini API keys are never bundled or called in client code; all requests are processed via Cloud Functions.
3. **Data Integrity & Non-Destruction:** Soft-delete mechanisms prevent accidental loss. Historical records retain cell coordinates and immutable timestamps.
4. **Philippine Civil Service Alignment:** Strictly complies with Civil Service Commission (CSC) IPCR guidelines and NIA Regional Office XI reporting standards.
