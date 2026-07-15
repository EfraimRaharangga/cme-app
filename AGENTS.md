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
│   │   │   └── UserController.php       # Admin account CRUD
│   │   └── Middleware/
│   │       ├── CustomAuthMiddleware.php # Redirects unauthenticated sessions
│   │       └── HandleInertiaRequests.php# Exposes shared auth & flash props to React
│   └── Models/                      # Eloquent relational models mapping database tables
│       ├── AtpPhoto.php
│       ├── AtpRecord.php
│       ├── AtpTemplate.php
│       ├── BalData.php
│       ├── BastpData.php
│       ├── GudangBarang.php
│       ├── GudangKeluar.php
│       ├── GudangKeluarDetail.php
│       ├── GudangMasuk.php
│       ├── GudangMasukDetail.php
│       ├── InstructionImage.php
│       ├── InstructionTable.php
│       ├── LoginLog.php
│       ├── Survey.php
│       ├── SurveyItem.php
│       ├── SurveyPhoto.php
│       ├── SurveyTemplate.php
│       └── User.php
├── bootstrap/
│   └── app.php                      # Pipeline config & middleware registrations
├── config/                          # Laravel system configurations
├── database/
│   ├── migrations/                  # Database schema definitions
│   └── seeders/                     # Initial seed data (default users & stocks)
├── public/
│   └── uploads/                     # Upload storage directories
│       ├── atp/                         # Checked ATP step photos
│       ├── gudang/                      # Stock logs invoices
│       └── photos/                      # Survey ODC check photos
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
    └── web.php                      # Application endpoints route mappings
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

## 4. Color Palette & UI Tokens

The design matches a high-end dark-charcoal theme:
*   `--primary`: `#1A1A1A` (Charcoal) - used for header backdrops, primary buttons, and table headers.
*   `--secondary`: `#00ADB5` (Teal) - used for highlights, progress bars, active statuses, and call-to-actions.
*   `--background`: `#FFFFFF` (White) - card and content backgrounds.
*   Typography uses the clean, modern **Inter** font for headings and structural labels, and **Roboto** for body copy.
*   Interactive grids use accordion expand/collapse panels to handle heavy logs, saving collapse states in `localStorage`.
