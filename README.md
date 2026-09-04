# AK QIMAASH — Modest Luxury, Redefined

A premium, full-featured modest luxury e-commerce platform crafted with modern web technologies, providing seamless shopping, responsive checkout, comprehensive admin operations, and a resilient dual-path transactional email dispatch engine.

---

## 🏛️ System Architecture Plan

```mermaid
graph TD
    subgraph Client ["Client Layer (React 19 + Vite SPA)"]
        UI["Customer Storefront & Catalog"]
        Cart["Cart & Zustand Store"]
        Checkout["Multi-Step Checkout Page"]
        Admin["Admin Management Dashboard"]
        EmailService["Resilient Email Service (Client)"]
    end

    subgraph Backend ["Backend & Database (Supabase)"]
        Auth["Supabase Auth (Magic Links, Passwords, MFA)"]
        DB[(PostgreSQL Database with RLS)]
        EdgeFn["Edge Functions ('send-order-email')"]
    end

    subgraph External ["External Services"]
        Brevo["Brevo SMTP / REST API"]
    end

    UI --> Auth
    UI --> DB
    Cart --> Checkout
    Checkout --> DB
    Checkout --> EmailService
    Admin --> DB
    Admin --> EmailService

    EmailService -.->|"1. Primary Attempt"| EdgeFn
    EdgeFn -->|"Deliver Email"| Brevo
    EmailService ==>|"2. Resilient Direct Fallback (if 404/error)"| Brevo
```

---

## 🔄 Order Lifecycle & Email Delivery Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant App as React Frontend (Checkout)
    participant SupabaseDB as Supabase Database (RLS)
    participant EmailSvc as Email Service
    participant EdgeFn as Supabase Edge Function
    participant Brevo as Brevo API

    Customer->>App: Submits Order (COD / Saved Address)
    App->>SupabaseDB: INSERT into `orders` & `order_items`
    SupabaseDB-->>App: Return Created Order (Order #, ID)
    
    App->>EmailSvc: sendOrderEmail({ orderId, status: 'PLACED', customerEmail, items, address })
    
    rect rgb(240, 248, 255)
        Note over EmailSvc,EdgeFn: Primary Attempt: Edge Function
        EmailSvc->>EdgeFn: invoke('send-order-email', payload)
        alt Edge Function Available (200 OK)
            EdgeFn->>Brevo: POST /v3/smtp/email
            Brevo-->>EdgeFn: 201 Created (Message ID)
            EdgeFn-->>EmailSvc: { success: true }
        else Edge Function Undeployed / 404 Error
            EdgeFn-->>EmailSvc: HTTP 404 NOT_FOUND
            Note over EmailSvc,Brevo: Automatic Fallback to Direct Brevo API
            EmailSvc->>Brevo: POST /v3/smtp/email (HTML Template + Payload)
            Brevo-->>EmailSvc: { messageId: '<...>' }
        end
    end

    EmailSvc-->>App: Delivery Confirmed
    App-->>Customer: Render Order Confirmation Screen
```

---

## 🗄️ Database Entity-Relationship Plan

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : "places"
    PROFILES ||--o{ USER_ROLES : "assigned"
    PROFILES ||--o{ ADDRESSES : "owns"
    ORDERS ||--|{ ORDER_ITEMS : "contains"
    ORDERS ||--|{ ORDER_STATUS_HISTORY : "tracks"
    PRODUCTS ||--|{ PRODUCT_VARIANTS : "has"
    PRODUCT_VARIANTS ||--o{ ORDER_ITEMS : "referenced_by"
    CATEGORIES ||--o{ PRODUCTS : "groups"

    PROFILES {
        uuid id PK
        string email
        string full_name
        string phone
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        string order_number UK
        uuid user_id FK
        string status
        string payment_method
        int subtotal_cents
        int gst_cents
        int delivery_cents
        int total_cents
        jsonb address_snapshot
        timestamp created_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        uuid variant_id FK
        string product_name
        string variant_size
        string variant_color
        int quantity
        int unit_price_cents
        int total_price_cents
    }

    PRODUCTS {
        uuid id PK
        string name
        string slug UK
        string description
        uuid category_id FK
        boolean is_active
        timestamp created_at
    }

    PRODUCT_VARIANTS {
        uuid id PK
        uuid product_id FK
        string sku UK
        string size
        string color
        int price_cents
        int stock_count
    }
```

---

## ✨ Features

- **Storefront & Catalog**: Rich collection browsing, variant selection (sizes, fabrics, colors), live stock tracking, and search.
- **Cart & Persistent State**: Frictionless cart drawer powered by Zustand with persistent local storage.
- **Checkout Pipeline**: Multi-step checkout with Singapore postal address validation, automatic GST (9%) and delivery fee calculation, and Cash-on-Delivery (COD).
- **Resilient Transactional Emails**:
  - Automatically sends responsive, branded HTML emails for every order status: `PLACED`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, and `CANCELLED`.
  - Dual-path dispatch: tries Supabase Edge Function first, with seamless client-side fallback to Brevo API (`https://api.brevo.com/v3/smtp/email`).
- **Admin Management Suite**:
  - Dashboard analytics (orders, revenues, inventory alerts).
  - Order processing & fulfillment with courier/tracking updates.
  - Product and inventory catalog management.
  - Customer profile administration and role management (`CUSTOMER`, `MANAGER`, `ADMIN`).
- **Security & Integrity**:
  - PostgreSQL Row Level Security (RLS) policies on every table.
  - Multi-Factor Authentication (MFA) challenge page and audit logging.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, TailwindCSS, Lucide Icons, React Hook Form, Zod.
- **State & Data**: TanStack React Query v5, Zustand.
- **Backend / Database**: Supabase (PostgreSQL 15+, Auth, Edge Functions, Row-Level Security).
- **Email Delivery**: Brevo API & SMTP Relay with responsive HTML templates.
- **Testing**: Vitest with unit tests covering commerce calculations, schema validations, and email delivery pipelines.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/Sivanarulanbu/AK-QIMAASH.git
cd AK-QIMAASH
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your configuration:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=AK QIMAASH

# Brevo Email Configuration
VITE_BREVO_API_KEY=your-brevo-api-key
VITE_BREVO_SENDER_EMAIL=orders@akqimaash.sg
VITE_BREVO_SENDER_NAME=AK QIMAASH
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Run Tests
```bash
npm test
```

### 6. Build for Production
```bash
npm run build
```

---

## 📄 License
Private and Proprietary — AK QIMAASH. All rights reserved.
