# Academic Code Review & Evaluation Platform (UNICODE)

Μια ολοκληρωμένη full-stack διαδικτυακή πλατφόρμα διαχείρισης και αξιολόγησης φοιτητικών εργασιών προγραμματισμού, σχεδιασμένη για ακαδημαϊκά περιβάλλοντα (Πανεπιστήμια, Κολλέγια, Σχολές Πληροφορικής). Η πλατφόρμα προσφέρει περιβάλλον In-line Code Review (στα πρότυπα του GitHub Pull Request interface με Monaco Editor), αυτοματοποιημένη ανάλυση κώδικα με Τεχνητή Νοημοσύνη (Google Gemini AI), διαχείριση εκδόσεων υποβολών (versioning), σύστημα ρόλων και δικαιωμάτων (RBAC), καθώς και πλήρη εποπτικά dashboards στατιστικών.

> 🌐 **Live Production App:** [https://unicode-app-production.up.railway.app](https://unicode-app-production.up.railway.app)

---

## Πίνακας Περιεχομένων

- [Βασικά Χαρακτηριστικά (Features)](#βασικά-χαρακτηριστικά-features)
- [Αρχιτεκτονική Συστήματος (Architecture Overview)](#αρχιτεκτονική-συστήματος-architecture-overview)
- [Προαπαιτούμενα Εγκατάστασης (Prerequisites)](#προαπαιτούμενα-εγκατάστασης-prerequisites)
- [Οδηγός Εκτέλεσης: Development Mode](#οδηγός-εκτέλεσης-development-mode)
- [Οδηγός Εκτέλεσης: Docker Environment](#οδηγός-εκτέλεσης-docker-environment)
- [Σενάριο Παρουσίασης (Live Demo Flow)](#σενάριο-παρουσίασης-live-demo-flow)
- [Δομή Φακέλων Έργου (Project Structure)](#δομή-φακέλων-έργου-project-structure)
- [Βασικά Endpoints (REST API Reference)](#βασικά-endpoints-rest-api-reference)
- [Ασφάλεια & Βέλτιστες Πρακτικές](#ασφάλεια--βέλτιστες-πρακτικές)
- [Συχνές Ερωτήσεις & Αντιμετώπιση Προβλημάτων (FAQ & Troubleshooting)](#συχνές-ερωτήσεις--αντιμετώπιση-προβλημάτων-faq--troubleshooting)

---

## Βασικά Χαρακτηριστικά (Features)

### 1. Ρόλοι Χρηστών & Αυστηρός Έλεγχος Πρόσβασης (RBAC)
- **Διαχειριστής (Admin):**
  - Έγκριση ή απόρριψη νέων εγγραφών χρηστών με άμεση απόδοση ρόλου (`TEACHER` ή `STUDENT`).
  - Πλήρης διαχείριση μαθημάτων και ανάθεση διδασκόντων.
  - Επισκόπηση στατιστικών πλατφόρμας (συνολικοί χρήστες, μαθήματα, ενεργές εργασίες, υποβολές).
- **Καθηγητής / Διδάσκων (Teacher):**
  - Δημιουργία μαθημάτων, ανάρτηση εργασιών με προθεσμίες και συνημμένα αρχεία προδιαγραφών (PDF, ZIP).
  - Διαχείριση αιτημάτων εγγραφής φοιτητών στα μαθήματα (Accept / Reject).
  - Λήψη υποβολών φοιτητών και αξιολόγηση μέσω ειδικής οθόνης In-line Code Review.
  - Δημιουργία σχολίων ανά γραμμή/μπλοκ γραμμών κώδικα και έναρξη διαλόγου (threaded discussion).
  - Επίλυση σχολίων (`Resolve`), βαθμολόγηση και καταγραφή τελικού feedback.
  - Αυτοματοποιημένη ανάλυση κώδικα εργασιών με χρήση **Google Gemini AI**.
- **Φοιτητής (Student):**
  - Αναζήτηση διαθέσιμων μαθημάτων και αποστολή αιτημάτων εγγραφής.
  - Προβολή ενεργών εργασιών, προθεσμιών (deadlines) και λήψη συνοδευτικών αρχείων.
  - Υποβολή κώδικα σε συμπιεσμένη μορφή (`.zip`) με αυτόματη αποσυμπίεση και υποστήριξη πολλαπλών εκδόσεων (`v1`, `v2`, ...).
  - Προβολή κώδικα, βαθμολογίας, feedback και των in-line σχολίων του καθηγητή.
  - Δυνατότητα απάντησης στα σχόλια του καθηγητή σε πραγματικό χρόνο.

### 2. Προηγμένη Οθόνη In-line Code Review (Monaco Editor)
- Ενσωμάτωση του **Monaco Editor** (της μηχανής του Visual Studio Code) στο web περιβάλλον.
- Δενδρική δομή αρχείων (File Tree Explorer) με οπτικές ενδείξεις (badges/dots) για αδιάβαστα και διαβασμένα σχόλια ανά αρχείο και φάκελο.
- Επιλογή μεμονωμένης γραμμής ή εύρους γραμμών κώδικα (line range) για προσθήκη σχολίου.
- Χρωματική επισήμανση (decorations) των σχολιασμένων γραμμών με διάκριση μεταξύ ανοιχτών (`Active`) και επιλυμένων (`Resolved`) threads.
- Αυτόματη μετακίνηση (scroll-to-line) στον κώδικα με κλικ σε οποιοδήποτε σχόλιο.

### 3. AI Code Analysis (Google Gemini Integration)
- Επιλογή συγκεκριμένων αρχείων ή φακέλων του project για άμεση τεχνική ανάλυση από AI.
- Παραγωγή δομημένης αναφοράς στα ελληνικά με:
  - **Περίληψη λειτουργίας** του υποβληθέντος κώδικα.
  - **Θετικά σημεία & καλές πρακτικές**.
  - **Εντοπισμό πιθανών bugs, λογικών σφαλμάτων και anti-patterns**.
- Ενσωματωμένοι μηχανισμοί ασφαλείας: φιλτράρισμα ευαίσθητων αρχείων (`.env`, `node_modules`, binaries) και έλεγχος μεγέθους payload (< 1MB).

### 4. Σύστημα Ειδοποιήσεων & Real-Time UX
- Αυτόματη καταγραφή ειδοποιήσεων για:
  - Νέα υποβολή φοιτητή (ενημέρωση καθηγητή).
  - Νέο σχόλιο σε γραμμή κώδικα (ενημέρωση φοιτητή).
  - Νέα απάντηση σε thread (ενημέρωση συνομιλητή).
  - Ολοκλήρωση βαθμολόγησης εργασίας (ενημέρωση φοιτητή).
- Dropdown ειδοποιήσεων στο Navbar με ένδειξη αδιάβαστων και άμεση πλοήγηση στην αντίστοιχη υποβολή.

### 5. Σύγχρονο Responsive UI & Dark/Light Mode
- Πλήρης υποστήριξη Dark και Light θεμάτων με αποθήκευση της προτίμησης του χρήστη (`localStorage`).
- Responsive διάταξη, σχεδιασμένη με Tailwind CSS v4 και Radix UI headless primitives.

---

## Αρχιτεκτονική Συστήματος (Architecture Overview)

```
                       +--------------------------------------------------+
                       |              Client (Web Browser)                |
                       |  React 19 + TypeScript + Vite + Tailwind CSS v4  |
                       |       Monaco Code Editor + TanStack Query        |
                       +--------------------------------------------------+
                                                │
                                    HTTP / REST API (JSON)
                                                ▼
                       +--------------------------------------------------+
                       |          API Gateway / Reverse Proxy             |
                       |               (Nginx / Express)                  |
                       +--------------------------------------------------+
                                                │
                                                ▼
                       +--------------------------------------------------+
                       |              Server (Node.js API)                |
                       |   Express.js + TypeScript + Helmet + Rate Limit  |
                       |    JWT Auth + RBAC Guards + Zip Processing Unit  |
                       +────────────────────────┬─────────────────────────+
                                                │
                      ┌─────────────────────────┴─────────────────────────┐
                      ▼                                                   ▼
     +----------------------------------+               +----------------------------------+
     |   PostgreSQL 16 (Relational DB)  |               |       Google Gemini API          |
     |   Managed via Prisma ORM v6      |               | (gemini-3.6-flash LLM Model)    |
     +----------------------------------+               +----------------------------------+
```

---

## Προαπαιτούμενα Εγκατάστασης (Prerequisites)

Για την εκτέλεση του project σε τοπικό περιβάλλον ανάπτυξης, βεβαιωθείτε ότι έχετε εγκατεστημένα:

1. **Node.js**: Έκδοση `v20.x` ή `v22.x` (LTS συνιστάται).
2. **npm**: Έκδοση `v10.x` ή νεότερη.
3. **Docker & Docker Compose**: Για την εκτέλεση της βάσης δεδομένων ή ολόκληρου του containerized stack.
4. **Google Gemini API Key** *(Προαιρετικό, απαιτείται μόνο για τη λειτουργία AI Code Review)*: Αποκτήστε δωρεάν κλειδί από το [Google AI Studio](https://aistudio.google.com/).

---

## Οδηγός Εκτέλεσης: Development Mode

Αυτή η μέθοδος είναι η ιδανική για ανάπτυξη και δοκιμές, καθώς παρέχει άμεσο Hot Module Reloading (HMR) τόσο στο frontend όσο και στο backend.

### Βήμα 1: Κλωνοποίηση του Repository & Εγκατάσταση Εξαρτήσεων
```bash
# Μετάβαση στον ριζικό φάκελο του project
cd code-review-platform-thesis

# Εγκατάσταση εξαρτήσεων σε Root, Client και Server ταυτόχρονα
npm run install:all
```

### Βήμα 2: Ρύθμιση Μεταβλητών Περιβάλλοντος (Environment Variables)

Δημιουργήστε το αρχείο `.env` μέσα στον φάκελο `server/`:
```bash
cp server/.env.example server/.env
```

Βεβαιωθείτε ότι το αρχείο `server/.env` περιέχει τις απαραίτητες παραμέτρους:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/codereview_db?schema=public"
JWT_SECRET="super-secret-cryptographic-jwt-key-min-32-chars"
CLIENT_ORIGIN="http://localhost:5173"
GEMINI_API_KEY="το-gemini-api-key-σας" # (Προαιρετικό)
```

*(Στο `client/` δεν απαιτείται αρχείο `.env` για τοπικό development, καθώς το Vite χρησιμοποιεί αυτόματο proxying προς το `http://localhost:5000/api`)*.

### Βήμα 3: Εκκίνηση της Βάσης Δεδομένων (PostgreSQL Container)
Εκκινήστε την PostgreSQL μέσω του Docker Compose:
```bash
npm run db:up
```

### Βήμα 4: Εκτέλεση Prisma Migrations & Seeding Δεδομένων
Εφαρμόστε το σχήμα της βάσης δεδομένων και γεμίστε την με τα έτοιμα δεδομένα επίδειξης (χρήστες, μαθήματα, εργασίες, υποβολές, σχόλια):
```bash
npm run prisma:migrate
npm run prisma:seed --prefix server
```

### Βήμα 5: Εκκίνηση Εφαρμογής σε Dev Mode
Εκκινήστε ταυτόχρονα το Backend API και το Frontend React client:
```bash
npm run dev
```

Η εφαρμογή είναι πλέον διαθέσιμη:
- **Frontend Web UI:** [http://localhost:5173](http://localhost:5173)
- **Backend REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(Προαιρετικά, για διαχείριση της βάσης δεδομένων με γραφικό περιβάλλον: `npm run prisma:studio --prefix server` στο [http://localhost:5555](http://localhost:5555))*.

---

## Οδηγός Εκτέλεσης: Docker Environment

Εάν θέλετε να εκτελέσετε ολόκληρο το stack (Client, Server, PostgreSQL Database) πλήρως απομονωμένο σε containers με παραγωγική διαμόρφωση (Production Mode):

### Βήμα 1: Εκκίνηση όλων των Services μέσω Docker Compose
Στον ριζικό φάκελο του project, εκτελέστε:
```bash
docker compose up --build -d
```

Αυτό θα δημιουργήσει και θα εκκινήσει 3 containers:
1. `codereview_postgres`: Η βάση δεδομένων PostgreSQL 16.
2. `codereview_server`: Το Node.js 22 Express API (εκτελεί αυτόματα `prisma migrate deploy`).
3. `codereview_client`: Το React UI σερβιρισμένο μέσω Nginx Web Server / Reverse Proxy.

### Βήμα 2: Αρχικοποίηση Demo Δεδομένων στο Docker Container
Μόλις τα containers είναι υγιή και ενεργά, εκτελέστε το seed script μέσα στο server container:
```bash
docker compose exec server npm run prisma:seed
```

### Βήμα 3: Πρόσβαση στην Εφαρμογή
- **Frontend & API Reverse Proxy:** [http://localhost](http://localhost) (Port 80)
- **Direct Backend API:** [http://localhost:5000/api](http://localhost:5000/api)

### Τερματισμός των Containers:
```bash
docker compose down
# Ή για πλήρη διαγραφή και των volumes δεδομένων:
docker compose down -v
```

---

## Σενάριο Παρουσίασης (Live Demo Flow)

Για μια πλήρη και δομημένη παρουσίαση των δυνατοτήτων της εφαρμογής (διάρκειας 3–5 λεπτών), ακολουθήστε τα παρακάτω βήματα:

### 1. Διαχείριση Χρηστών (Admin)
1. Συνδεθείτε με λογαριασμό **Διαχειριστή**.
2. Μεταβείτε στην καρτέλα **Users / Χρήστες**.
3. Εντοπίστε τις εκκρεμείς αιτήσεις εγγραφής νέων χρηστών.
4. Πατήστε **Έγκριση** (Approve) αποδίδοντας τον κατάλληλο ρόλο (`TEACHER` ή `STUDENT`).
5. Αποσυνδεθείτε (Logout).

### 2. Αξιολόγηση & In-line Code Review (Teacher)
1. Συνδεθείτε με λογαριασμό **Καθηγητή**.
2. Στο Overview Dashboard, δείτε τα στατιστικά των μαθημάτων, τις εκκρεμείς αξιολογήσεις και τις υποβολές.
3. Μεταβείτε σε ένα μάθημα $\to$ **Εργασίες** $\to$ **Υποβολές**.
4. Επιλέξτε την υποβολή ενός φοιτητή και πατήστε **Review Code**.
5. **Στην Οθόνη Code Review:**
   - Περιηγηθείτε στο File Tree των αρχείων κώδικα.
   - Παρατηρήστε τα χρωματικά highlights στις γραμμές κώδικα και διαβάστε τα νήματα συζήτησης (Threads).
   - Επιλέξτε νέες γραμμές κώδικα και προσθέστε ένα νέο σχόλιο.
   - Πατήστε το κουμπί **AI Code Analysis**, επιλέξτε αρχεία κώδικα και δείτε τη σύνοψη που παράγει το Google Gemini AI.
   - Τροποποιήστε τον βαθμό, προσθέστε τελικό feedback και πατήστε **Αποθήκευση Βαθμολογίας**.
6. Αποσυνδεθείτε (Logout).

### 3. Εμπειρία Φοιτητή (Student)
1. Συνδεθείτε με λογαριασμό **Φοιτητή**.
2. Δείτε στο Dashboard τον βαθμό σας και τις σχετικές ειδοποιήσεις στο καμπανάκι του Navbar.
3. Ανοίξτε την εργασία και πατήστε **Προβολή Αξιολόγησης / Κώδικα**.
4. Διαβάστε τα σχόλια του καθηγητή και πληκτρολογήστε μια απάντηση (reply) στο thread.
5. Μεταβείτε στα **Διαθέσιμα Μαθήματα** και κάντε αίτηση εγγραφής σε νέο μάθημα.

---

## Δομή Φακέλων Έργου (Project Structure)

```
code-review-platform-thesis/
├── client/                           # React 19 Frontend Application
│   ├── src/
│   │   ├── components/               # Επαναχρησιμοποιήσιμα UI Components (Radix UI, Layouts)
│   │   ├── contexts/                 # AuthContext & ThemeContext Providers
│   │   ├── features/
│   │   │   ├── admin/                # Admin Panel Components & API calls
│   │   │   ├── auth/                 # Login, Register & Validation Schemas
│   │   │   ├── courses/              # Courses, Assignments, Submissions & Monaco Code Review
│   │   │   └── dashboard/            # Role-based Analytics Dashboards
│   │   ├── hooks/                    # Custom Hooks (useMonacoComments, useCommentBadges)
│   │   ├── lib/                      # TanStack QueryClient & Utility Functions (cn)
│   │   ├── App.tsx                   # Κεντρικό Routing & Layout Definitions
│   │   └── main.tsx                  # React Application Entrypoint
│   ├── Dockerfile                    # Multi-stage Docker build (Vite build -> Nginx)
│   ├── nginx.conf                    # Nginx configuration & API Reverse Proxy
│   └── package.json
│
├── server/                           # Express.js & TypeScript Backend API
│   ├── prisma/
│   │   ├── schema.prisma             # Ορισμός Σχήματος Βάσης Δεδομένων (PostgreSQL)
│   │   ├── migrations/               # Ιστορικό Database Migrations
│   │   └── seed.ts                   # Script Αρχικοποίησης Demo Δεδομένων
│   ├── src/
│   │   ├── config/                   # Configuration & Strict Zod Environment Validation
│   │   ├── errors/                   # Custom Error Classes (AppError, NotFoundError, etc.)
│   │   ├── lib/                      # Prisma Client Instance
│   │   ├── middlewares/              # JWT Auth, RBAC Guards, Rate Limiter, Error Handler
│   │   ├── modules/
│   │   │   ├── admin/                # Admin User Approval Module
│   │   │   ├── ai/                   # Google Gemini AI Code Analysis Controller
│   │   │   ├── assignment/           # Assignments & Attachments Module
│   │   │   ├── auth/                 # Registration, Login, Profile & JWT Management
│   │   │   ├── comment/              # In-line Comments, Threads & Read States
│   │   │   ├── course/               # Courses CRUD & Enrollments Management
│   │   │   ├── dashboard/            # Aggregation Queries & Role Analytics
│   │   │   ├── files/                # Attachment & Submission ZIP Downloads
│   │   │   ├── notification/         # User In-App Notifications
│   │   │   └── submission/           # Zip Uploads, Safe Extraction & Versioning
│   │   ├── utils/                    # Authorization Guard Helpers
│   │   ├── app.ts                    # Express App Setup, Security Middlewares & Routing
│   │   └── index.ts                  # Server Entrypoint
│   ├── uploads/                      # Φυσική αποθήκευση αρχείων και εξαχθέντων κωδίκων
│   ├── Dockerfile                    # Multi-stage Docker build (Builder -> Runner)
│   └── package.json
│
├── docker-compose.yml                # Orchestration για Postgres, Server & Client
└── package.json                      # Root Orchestration Scripts (concurrently)
```

---

## Βασικά Endpoints (REST API Reference)

| Μέθοδος | Endpoint | Ρόλοι | Περιγραφή |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Εγγραφή νέου χρήστη (εκκρεμεί έγκριση) |
| `POST` | `/api/auth/login` | Public | Σύνδεση χρήστη & έκδοση JWT Token |
| `GET` | `/api/auth/me` | Authenticated | Ανάκτηση στοιχείων συνδεδεμένου χρήστη |
| `GET` | `/api/admin/pending-users` | `ADMIN` | Λίστα χρηστών που εκκρεμούν προς έγκριση |
| `POST` | `/api/admin/approve-user/:userId`| `ADMIN` | Έγκριση χρήστη και απόδοση ρόλου |
| `GET` | `/api/courses` | Authenticated | Λίστα μαθημάτων (προσαρμοσμένη ανά ρόλο) |
| `POST` | `/api/courses` | `ADMIN`, `TEACHER`| Δημιουργία νέου μαθήματος |
| `POST` | `/api/courses/:courseId/enroll` | `STUDENT` | Αίτηση εγγραφής σε μάθημα |
| `POST` | `/api/courses/:courseId/assignments` | `TEACHER`, `ADMIN` | Δημιουργία νέας εργασίας |
| `POST` | `/api/assignments/:assignmentId/submissions` | `STUDENT` | Μεταφόρτωση ZIP εργασίας (νέα έκδοση) |
| `GET` | `/api/assignments/:assignmentId/submissions` | `TEACHER`, `ADMIN` | Προβολή όλων των υποβολών μιας εργασίας |
| `GET` | `/api/assignments/:assignmentId/submissions/file-content` | Authenticated | Ανάγνωση περιεχομένου αρχείου κώδικα |
| `POST` | `/api/submissions/:submissionId/comments` | Authenticated | Δημιουργία In-line σχολίου σε γραμμές κώδικα |
| `POST` | `/api/comments/:commentId/messages` | Authenticated | Προσθήκη απάντησης σε νήμα σχολίου |
| `PATCH`| `/api/comments/:commentId/resolve` | `TEACHER`, `ADMIN` | Επίλυση ή επαναφορά σχολίου |
| `POST` | `/api/assignments/:assignmentId/submissions/:id/grade` | `TEACHER`, `ADMIN` | Βαθμολόγηση & τελικό feedback υποβολής |
| `POST` | `/api/ai/analyze` | `TEACHER`, `ADMIN` | Εκτέλεση AI Code Analysis μέσω Google Gemini |
| `GET` | `/api/dashboard/analytics` | Authenticated | Στατιστικά και KPIs προσαρμοσμένα ανά ρόλο |

---

## Ασφάλεια & Βέλτιστες Πρακτικές

1. **Προστασία από Zip Slip Attacks:**
   Κατά την αποσυμπίεση των υποβολών των φοιτητών, γίνεται αυστηρός έλεγχος των διαδρομών (`path canonicalization` με `path.resolve`) για να αποτραπεί η εγγραφή αρχείων έξω από τον επιτρεπόμενο φάκελο.
2. **Directory Traversal Protection:**
   Το endpoint ανάγνωσης αρχείων κώδικα επαληθεύει ότι το ζητούμενο αρχείο βρίσκεται αυστηρά εντός του φακέλου της συγκεκριμένης υποβολής.
3. **Κρυπτογράφηση & Ασφαλής Αυθεντικοποίηση:**
   - Όλοι οι κωδικοί πρόσβασης κρυπτογραφούνται με τον αλγόριθμο `bcrypt` (10 salt rounds).
   - Τα JWT Tokens υπογράφονται με ασφαλές μυστικό κλειδί (ελάχιστο μήκος 32 χαρακτήρων) και επικυρώνονται σε κάθε αίτημα.
4. **Hardened HTTP Headers & Rate Limiting:**
   - Χρήση του `helmet` για αφαίρεση του header `X-Powered-By` και εφαρμογή αυστηρών security headers.
   - Χρήση του `express-rate-limit` για προστασία από επιθέσεις άρνησης εξυπηρέτησης (DoS) και brute-force.
5. **Strict Schema Validation:**
   Όλα τα εισερχόμενα δεδομένα επικυρώνονται σε επίπεδο runtime μέσω σχημάτων **Zod**.

---

## Συχνές Ερωτήσεις & Αντιμετώπιση Προβλημάτων (FAQ & Troubleshooting)

### 1. Σφάλμα σύνδεσης με τη βάση δεδομένων (Prisma / P1001)
- Βεβαιωθείτε ότι το container της PostgreSQL εκτελείται: `docker ps`.
- Εάν η θύρα `5432` χρησιμοποιείται από τοπική εγκατάσταση Postgres στο μηχάνημά σας, τερματίστε την τοπική υπηρεσία (`sudo service postgresql stop`) ή αλλάξτε το port mapping στο `docker-compose.yml`.

### 2. Σφάλμα "Invalid Environment Configuration" κατά την εκκίνηση του Server
- Βεβαιωθείτε ότι έχετε αντιγράψει το `server/.env.example` σε `server/.env`.
- Ελέγξτε ότι το `JWT_SECRET` έχει μήκος τουλάχιστον 16 χαρακτήρες και ότι το `DATABASE_URL` είναι έγκυρο.

### 3. Πώς επαναφέρω τα Demo Δεδομένα σε καθαρή κατάσταση;
Εκτελέστε απλά:
```bash
npm run prisma:seed --prefix server
```
Το script χρησιμοποιεί `upsert` queries, διασφαλίζοντας ότι τα demo δεδομένα θα συγχρονιστούν άμεσα χωρίς να απαιτείται διαγραφή της βάσης.

---

**Έργο Πτυχιακής Εργασίας (Thesis Project)**  
*Ανάπτυξη: Dimitris Theodorou*
