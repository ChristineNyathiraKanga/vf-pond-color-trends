# Pond Color Matcher System

> **Automated water-color classification for fish ponds, powered by a browser eye-dropper, Euclidean distance matching, and a  green palette.**

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)](https://flask.palletsprojects.com)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://python.org)
[![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?logo=amazons3)](https://aws.amazon.com/s3/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose/)
[![Live](https://img.shields.io/badge/Live-colorpicker.victoryfarmskenya.com-green)](https://colorpicker.victoryfarmskenya.com)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Features](#2-features)
3. [System Architecture](#3-system-architecture)
4. [Color Palette Reference](#4-color-palette-reference)
5. [Prerequisites](#5-prerequisites)
6. [Installation](#6-installation)
7. [Configuration](#7-configuration)
8. [Usage](#8-usage)
9. [API Reference](#9-api-reference)
10. [Database Schema](#10-database-schema)
11. [Data Pipeline — AWS S3 & Power BI](#11-data-pipeline--aws-s3--power-bi)
12. [Module Reference](#12-module-reference)
13. [Maintenance](#13-maintenance)
14. [Contributing Guidelines](#14-contributing-guidelines)

---

## 1. Introduction

The **Pond Color Matcher System** is a full-stack web application that automates the classification of fish pond water colour from drone images. 

Users open the **Color Picker** page, upload a drone image, then use a **browser eye-dropper** to sample the pond water colour directly from the photo. The sampled hex colour is sent to the Flask backend, which uses the **Euclidean distance formula** to find the closest match in a curated **57-colour green palette** (starting from *Sea Nettle* and moving downward toward the deepest greens). The matched colour name and hex code are stored in a **SQLite database** and simultaneously written to a **CSV file on AWS S3**, where they feed a **Power BI dashboard** for trend monitoring over time.

The companion **Color Trends** (Report) page renders all historical submissions in a paginated table and allows operators to export the full dataset as a structured excel file, with ponds as rows and dates as columns.

**Live URL:** [https://colorpicker.victoryfarmskenya.com](https://colorpicker.victoryfarmskenya.com)

---

## 2. Features

| Feature | Description |
|---|---|
| 🖱️ Browser Eye-Dropper | Uses the native `EyeDropper` Web API to sample any pixel from the uploaded pond image |
| 🎨 Euclidean Color Matching | Finds the perceptually closest  palette colour using 3D RGB distance |
| 📦 Batch Entry (up to 20) | Process up to 20 pond colour picks per image submission in a single form |
| 🗄️ Dual-Write Storage | Every submission is saved to both a relational database (SQLite / MySQL) and a CSV on AWS S3 |
| 📊 Paginated Report Table | Color Trends page shows all entries with image preview, colour swatch, category, pond, and date |
| 📥 Excel Export | One-click export to excel file — pivoted with ponds as rows, dates as columns |
| 🗑️ Record Deletion | Delete individual submissions from both the database and the S3 CSV simultaneously |
| 📡 Power BI Pipeline | S3 CSV is the live data source for the Power BI dashboard via `toS3/tos3.py` |
| 🐳 Docker Compose | Single-command local deployment of frontend (Nginx) and backend (Flask) services |
| 🔐 JWT Authentication | User login protected with bcrypt-hashed passwords and JWT tokens |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       User (Drone Operator)                       
│  Opens colorpicker.victoryfarmskenya.com in Chrome              │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│              React Frontend  (frontend/src)                      │
│                                                                  │
│  ┌────────────────────────┐   ┌──────────────────────────────┐   │
│  │  Color Picker Page     │   │  Color Trends / Report Page  │   │
│  │  ColorPicker.js        │   │  Report.js                   │   │
│  │                        │   │                              │   │
│  │  1. Upload drone image │   │  - Fetches all submissions   │   │
│  │  2. Select entries (1-20)  │  - Paginated table (20/page) │   │
│  │  3. Eye-dropper pick   │   │  - Image preview modal       │   │
│  │  4. /match-color call  │   │  - Delete record             │   │
│  │  5. Display matched    │   │  - Export → Excel (.xlsx)    │   │
│  │     palette colour     │   │                              │   │
│  │  6. Submit all entries │   └──────────────────────────────┘   │
│  └────────────────────────┘                                      │
│                                                                  │
│  Components: Header.js | ColorPalette.js | Footer.js            │
│  Styling: Tailwind CSS v3                                        │
└───────────────────────────┬──────────────────────────────────────┘
                            │  REST API (JSON)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│             Flask Backend  (backend/app.py)                      │
│                                                                  │
│  POST /match-color   → Euclidean distance → closest palette      │
│  POST /submit        → Base64 decode image → save to disk        │
│                        → append row to S3 CSV                   │
│                        → INSERT into SQLAlchemy DB              │
│  GET  /submitted-data → Read S3 CSV → return JSON (cached 5s)  │
│  DELETE /delete-data/<id> → Remove row from S3 CSV + DB        │
│  POST /create_user   → bcrypt hash → INSERT User               │
│  POST /login         → verify password → return JWT             │
└───────────┬───────────────────────────┬──────────────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────┐   ┌──────────────────────────────────────┐
│  SQLite / MySQL DB  │   │  AWS S3 Bucket: pondcolours          │
│  pond_color_trends  │   │  Key: colours/submissions.csv        │
│  pond_users         │   │                                      │
└─────────────────────┘   │  → PowerBI Dashboard (live source)  │
                          │  → toS3/tos3.py  (manual seed)      │
                          └──────────────────────────────────────┘
```

### Deployment

```
Docker Compose
├── frontend  (React build served by Nginx on port 80)
└── backend   (Flask Gunicorn on port 5000)
```

Nginx (`frontend/nginx.conf`) proxies `/backend/*` requests to the Flask container, making both services available on a single domain.

---

## 4. Color Palette Reference

The matching palette contains **57  green shades**, ordered from lightest to darkest. The `closest_color()` function always searches the full list and picks the minimum Euclidean distance in RGB space. The complete list is defined in `backend/app.py` in the `colors` array and rendered visually in the frontend via `frontend/src/components/ColorPalette.js`.

---

## 5. Prerequisites

### 5.1 Backend

| Requirement | Version |
|---|---|
| Python | 3.10+ |
| pip | 23+ |

Key Python dependencies (from `backend/requirements.txt`):

| Library | Purpose |
|---|---|
| `flask` | REST API framework |
| `flask-sqlalchemy` | ORM for SQLite / MySQL |
| `flask-cors` | Cross-origin requests from React |
| `flask-caching` | 5-second simple cache on `/submitted-data` |
| `numpy` | Euclidean distance calculation (`np.linalg.norm`) |
| `boto3` | AWS S3 read / write for CSV storage |
| `werkzeug` | Password hashing (`generate_password_hash`) |
| `PyJWT` | JWT token generation and verification |
| `gunicorn` | Production WSGI server |

### 5.2 Frontend

| Requirement | Version |
|---|---|
| Node.js | 18+ |
| npm / yarn | Latest |

Key npm packages (from `frontend/package.json`):

| Package | Purpose |
|---|---|
| `react` `react-dom` | UI framework (v18) |
| `react-router-dom` | Client-side routing |
| `use-eye-dropper` | Browser EyeDropper API wrapper |
| `axios` | HTTP client for API calls |
| `xlsx` | Client-side Excel export |
| `react-paginate` | Pagination component for Report page |
| `sweetalert2` | Success / error / confirm dialogs |
| `date-fns` `date-fns-tz` | Date parsing and Kenya timezone handling |
| `lodash` | Debounce on `fetchData` |
| `tailwindcss` | Utility-first CSS styling |
| `@heroicons/react` | SVG icons |

### 5.3 Infrastructure

| Service | Purpose |
|---|---|
| **AWS S3** — bucket `pondcolours` | Primary data store (`colours/submissions.csv`) |
| **AWS IAM** | User with `s3:GetObject`, `s3:PutObject` permissions on `pondcolours` |
| **Docker & Docker Compose** | Container orchestration for local and production |
| **Power BI** | Consumes the S3 CSV for the pond colour trend dashboard |

---

## 6. Installation

### 6.1 Clone the Repository

```bash
git clone https://github.com/<your-org>/pond-color-matcher.git
cd pond-color-matcher
```

### 6.2 Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialise the database
python migrate.py
```

### 6.3 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
# or
yarn install
```

### 6.4 Docker Compose (Recommended for Production)

```bash
# From the project root
docker-compose up --build
```

This starts:
- **Frontend** on `http://localhost:80` (Nginx serving the React build)
- **Backend** on `http://localhost:5000` (Flask)

---

## 7. Configuration

### 7.1 Backend — `backend/config.py`

All configuration lives in `Config`. For production, override values via environment variables injected into the Docker container.

| Key | Default | Description |
|---|---|---|
| `SECRET_KEY` | `7rW75KvUQrCudaU` | Flask session & JWT signing key — **change in production** |
| `SQLALCHEMY_DATABASE_URI` | `sqlite:///pond_images.db` | Switch to MySQL URI for production (see commented line) |
| `UPLOAD_FOLDER` | `static/uploads` | Local disk path where submitted images are saved |
| `AWS_ACCESS_KEY` | — | IAM access key ID |
| `AWS_SECRET_KEY` | — | IAM secret access key |
| `AWS_REGION`  | S3 bucket region |
| `AWS_S3_BUCKET` | `pondcolours` | S3 bucket name |
| `CSV_S3_KEY` | `colours/submissions.csv` | S3 object key for the master CSV |
| `GLOBAL_URL` | `Your URL` | Global URL for the application |

### 7.2 Frontend — Environment Files

| File | Purpose |
|---|---|
| `frontend/.env.local` | Local development — sets `GLOBAL_URL` |
| `frontend/.env.production` | Production build — points to `GLOBAL_URL/backend` |

### 7.3 Database Migration

```bash
cd backend
python migrate.py
```

`migrate.py` calls `db.create_all()` to create the `pond_color_trends` and `pond_users` tables.

---

## 8. Usage

### 8.1 Run Locally (without Docker)

**Backend:**
```bash
cd backend
# Activate venv first
python app.py
# Flask starts on http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm start
# React dev server on http://localhost:3000
```
---

## 9. Data Pipeline — AWS S3 & Power BI

```
┌─────────────────────────────────────────────────────────┐
│  Flask /submit endpoint                                 │
│  → Appends row(s) to S3: colours/submissions.csv        │
└──────────┬──────────────────────────────────────────────┘
           │  (live, every submission)
           ▼
┌─────────────────────────────────────────────────────────┐
│  AWS S3 Bucket: pondcolours                             │
│  Key: colours/submissions.csv                           │
│  Region: ap-south-1                                     │
└──────────┬──────────────────────────────────────────────┘
           │  (Power BI direct query)
           ▼
┌─────────────────────────────────────────────────────────┐
│  Power BI Dashboard                                     │
│  – Colour trend by pond over time                       │
│  – Category-level aggregations                          │
└─────────────────────────────────────────────────────────┘
```

**Manual seed / override:**

If you need to seed S3 with a historical export or replace the live CSV:

```bash
cd toS3
# Edit LOCAL_FILE_PATH in tos3.py to point to your CSV
python tos3.py
```

The script checks for an existing S3 object before uploading and logs the result to stdout.

---


### 10. Getting Started

1. **Fork** the repository and clone your fork.
2. Create a branch from `develop`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Set up the backend and frontend as described in [Installation](#6-installation).
4. Create a `.env.local` in `frontend/` pointing to your local Flask server.



Powered by [Flask](https://flask.palletsprojects.com), [React](https://react.dev), [AWS S3](https://aws.amazon.com/s3/), and [Power BI](https://powerbi.microsoft.com).