# Technical Specifications & System Architecture: Central Monitoring & Evaluation (CME) Laravel App

This document provides a comprehensive technical overview of the refactored **CME Application**, migrated from legacy monolithic PHP to a modern monolithic framework architecture.

---

## 1. Tech Stack & Infrastructure

The application is structured as a modern SPA-like monolithic application utilizing the following technologies:

### Backend (Laravel 11)
*   **Language:** PHP 8.x.
*   **Framework:** Laravel 11.x Core.
*   **Database:** MySQL / MariaDB relational engine.
*   **Database Access:** Eloquent ORM with strict Parameterized Statements mapping.
*   **Security:** Manual session-based verification (`session('user_id')`) with BCrypt password hashing. Custom middleware (`CustomAuthMiddleware`) acts as security guard.
*   **Data Transport:** Inertia.js server-side controller-to-view props binder.

### Frontend (React & Tailwind CSS v4)
*   **Core:** React 18.x with Vite asset compilation.
*   **Routing:** Inertia.js client-side router (SPA behavior, no page reloads).
*   **Styling:** Tailwind CSS v4 custom color theme defined inside `@theme` tags in `resources/css/app.css`.
    *   **Primary HSL:** `#1A1A1A` (Charcoal / Jet Black)
    *   **Secondary HSL:** `#00ADB5` (Teal)
    *   **Background:** `#FFFFFF` (Pure White)
*   **Iconography:** `lucide-react` minimalist thin line-art icons (`stroke-[1.5]`).
*   **Geolocation Map API:** Leaflet.js interactive maps for coordinate capture and pin placement.

---

## 2. Directory Layout

The core application code is organized as follows within the Laravel directory hierarchy:

```bash
cme-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/             # View and request handlers
│   │   │   ├── AtpController.php        # ATP checklists and BAL/BASTP documents
│   │   │   ├── DashboardController.php  # Statistics and summaries
│   │   │   ├── GudangController.php     # Stock ledger and transaction logs
│   │   │   ├── InstructionController.php # SOW guidelines
│   │   │   ├── LoginController.php      # Manual session login
│   │   │   ├── MediaController.php      # Installs temp upload handler
│   │   │   └── UserController.php       # Admin account CRUD
│   │   ├── Middleware/
│   │   │   ├── CustomAuthMiddleware.php # Redirects unauthenticated sessions
│   │   │   └── HandleInertiaRequests.php# Exposes shared auth & flash props to React
│   │   └── Requests/                # Form request validation modules
│   │       ├── LoginRequest.php
│   │       ├── StoreAtpRequest.php
│   │       ├── StoreAtpTemplateRequest.php
│   │       ├── StoreGudangKategoriRequest.php
│   │       ├── StoreGudangKeluarRequest.php
│   │       ├── StoreGudangMasukRequest.php
│   │       ├── StoreGudangTipeRequest.php
│   │       ├── StoreSurveyRequest.php
│   │       ├── StoreSurveyTemplateRequest.php
│   │       ├── StoreUserRequest.php
│   │       ├── TempUploadRequest.php
│   │       ├── UpdateAtpRequest.php
│   │       ├── UpdateSurveyRequest.php
│   │       └── UpdateUserRequest.php
│   └── Models/                      # Eloquent relational models mapping database tables
│       ├── AtpPhoto.php             # Uses Spatie MediaLibrary trait
│       ├── AtpRecord.php
│       ├── AtpTemplate.php
│       ├── BalData.php
│       ├── BastpData.php
│       ├── GudangBarang.php
│       ├── GudangKeluar.php          # Uses Spatie MediaLibrary trait
│       ├── GudangKeluarDetail.php
│       ├── GudangMasuk.php           # Uses Spatie MediaLibrary trait
│       ├── GudangMasukDetail.php
│       ├── InstructionImage.php     # Uses Spatie MediaLibrary trait
│       ├── InstructionTable.php
│       ├── LoginLog.php
│       ├── Survey.php
│       ├── SurveyItem.php
│       ├── SurveyPhoto.php          # Uses Spatie MediaLibrary trait
│       ├── SurveyTemplate.php
│       └── User.php
├── bootstrap/
│   └── app.php                      # Pipeline config & middleware registrations
├── config/                          # Laravel system configurations
├── database/
│   ├── migrations/                  # Database schema definitions (including media table)
│   └── seeders/                     # Initial seed data (default users & stocks)
├── public/
│   └── uploads/                     # Upload storage directories (legacy fallback and temp)
├── resources/
│   ├── css/
│   │   └── app.css                  # Tailwind v4 directives & typography mapping
│   ├── js/
│   │   ├── app.jsx                  # Inertia React mounting bootstrapper
│   │   ├── Components/              # Reusable UI elements (Button, Input, Select, Table)
│   │   ├── Layouts/
│   │   │   └── AppLayout.jsx        # Sidebar collapsible drawer & navigation
│   │   └── Pages/                   # Inertia React page views
│   │       ├── Login.jsx            # Sign-in form
│   │       ├── Dashboard/           # Dashboards (CME, Survey, ATP)
│   │       ├── Survey/              # ODC survey forms, history, and printing views
│   │       ├── Atp/                 # ATP checklists, details, BAL, BASTP views
│   │       ├── Gudang/              # Stock ledgers, transactions, history
│   │       ├── Instruction/         # SOW specification guides
│   │       └── User/                # Admin account CRUD & login logs audit
│   └── views/
│       └── app.blade.php            # Base template containing react scripts
└── routes/
    └── web.php                      # Application endpoints route mappings (including /api/upload-temp)
```

---

## 3. Core Architectural Conventions

To maintain system integrity and compliance, developer guidelines are defined below:

### Manual Authentication Pipeline
The application uses session keys rather than Laravel guards.
1.  On successful login, the controller stores `user_id`, `username`, and `role` in the session.
2.  `CustomAuthMiddleware` intercepts protected web routes and redirects to `/` if `user_id` is missing.
3.  `HandleInertiaRequests` reads the session and loads `auth.user` prop values for the React interface.
4.  Logout clears the session and invalidates the session ID.

### Database Transaction & Safety
All operations that write multiple rows (such as saving a survey or ATP checklist while logging photos, or updating inventory ledger quantities during warehouse transactions) are wrapped in `DB::transaction()` blocks. This ensures consistency and prevents partial writes if an error occurs.

### Dynamic JSON Schema Casting
To support flexible checklists without database schema bloat:
*   `AtpRecord` serializes checkpoint results (`hasil_json`, `approval_json`, `bastp_json`) into structured text columns.
*   The Eloquent attributes are defined as `protected $casts = ['hasil_json' => 'array']`, automatically converting database strings to and from arrays.
*   On client-side render, the React frontend maps these arrays into form fields.

### Printing Optimization
Printed layouts (BAL, BASTP, survey print) use clean A4-optimized CSS media queries (`@media print` and `@page`) to suppress sidebars, footers, headers, and scale tables precisely.

---

## 4. UI/UX & Styling Guidelines

To maintain visual cohesion, accessibility, and high performance across all views, developers must adhere to the design system implemented during the UI/UX refactoring:

### A. Design Tokens & Styling
*   **Palette Enforcement:**
    *   **Primary Charcoal (`#1A1A1A`):** Used for base text, headers, and side navigation background.
    *   **Secondary Teal (`#00ADB5`):** Reserved for primary action buttons, hover states, active menu borders, markers, and accent colors.
    *   **Background (`#FFFFFF`):** High contrast white workspace containers. Avoid gray backgrounds for main body containers.
*   **Typography Hierarchy:**
    *   **Headings:** Montserrat or Inter (semi-bold/bold) with tracking-tight.
    *   **Body & Form Inputs:** Roboto or Open Sans for high readability and numeric scanability.
*   **Iconography:**
    *   Exclusively use `lucide-react` icons.
    *   Apply thin stroke widths (`stroke-[1.5]`) and consistent sizes (typically `h-4 w-4` or `h-5 w-5`). Never mix with heavy-weight icons.

### B. Persistent SPA Layouts
All views within the system (except standalone prints and the login page) must use Inertia.js **persistent layouts** rather than wrapping content with `<AppLayout>` inline. 
1.  Remove `<AppLayout>` tags from the page component's JSX return.
2.  Bind the layout property to the page component before exporting:
    ```javascript
    PageName.layout = page => <AppLayout children={page} />;
    ```
This preserves sidebar collapse states, input forms state during navigation, and triggers layout-wide page transition animations.

### C. Animated UI Elements (Framer Motion)
Ensure smooth transition timings and bounce parameters for interactive elements:
*   **Page Navigation Transitions:** Wrapped in `AnimatePresence` inside `AppLayout.jsx`. Keyed on route URLs:
    ```javascript
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.2 }}
    ```
*   **Reusable Modals (`Modal.jsx`):** Employs standard spring physics (`type: 'spring', duration: 0.3, bounce: 0.15`) for backdrop fades and dialog scale-up/fade. Always include click-outside overlay and Escape-key listeners.
*   **Flash Messages (`FlashMessage.jsx`):** Slide-in and slide-out spring animations positioned at the bottom-right corner.

### D. Asymmetrical Dashboard Layouts
Maximize information hierarchy on large screens using a `2:1` grid system (`grid grid-cols-1 lg:grid-cols-3 gap-8`):
*   **Main content area (`lg:col-span-2`):** Displays data tables, transaction charts, or details checklist.
*   **Side-rail component (`lg:col-span-1`):** Displays field guidelines, verdict definitions, PO info cards, or quick-action shortcuts.

### E. Form Submission & State
All action buttons rendering submits must bind a `processing` boolean:
*   Keep the button disabled (`disabled={processing}`) to block duplicate requests.
*   Render a revolving inline loading SVG spinner next to the text during execution.

