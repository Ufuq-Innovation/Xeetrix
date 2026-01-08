# 🚀 Xeetrix: The Ultimate Business Control Room (SaaS)

**Xeetrix** is a 360-degree e-commerce operating system designed to move business owners from "Management Chaos" to "Data-Driven Control." It's the central command center for sales, inventory, accounting, marketing, and logistics.

---

## 🎯 The Vision: "Total Business Transparency"
Xeetrix eliminates the need for switching between multiple apps. From tracking a single Facebook message to calculating the monthly ROAS (Return on Ad Spend), everything happens inside the Xeetrix Control Room.

---

## 📂 Detailed Project Structure (Directory Tree)

```text
Xeetrix/
├── app/
│   ├── (auth)/                 # Authentication (Login, Register, Reset Password)
│   ├── (dashboard)/            # Main Business Interface
│   │   ├── analytics/          # Business Intelligence & Reports
│   │   ├── inventory/          # Stock Management & Adjustment Pages
│   │   ├── ledger/             # Searchable Transaction History
│   │   ├── marketing/          # Ad-spend Tracking & Content Planner
│   │   ├── orders/             # Unified POS (Online/Offline) Dashboard
│   │   └── settings/           # Business Profile & Currency Settings
│   ├── api/                    # Backend logic & API Endpoints
│   │   ├── inventory/          # Product CRUD & Stock Update API
│   │   ├── orders/             # Transaction & Invoice Processing
│   │   ├── ledger/             # Financial History Retrieval
│   │   └── marketing/          # Ad-data & ROAS calculation API
│   ├── globals.css             # Tailwind Global Styles
│   └── layout.js               # Root Layout with Theme & Providers
├── components/
│   ├── pos/                    # POS Components (Cart, Customer, Payments)
│   ├── inventory/              # Product Forms, Stock Alert Modals
│   ├── marketing/              # Ad Spend Charts, Marketing Cards
│   ├── shared/                 # Sidebar, Navbar, Page Headers
│   └── ui/                     # Shadcn / Reusable UI Primitives
├── context/
│   ├── AppContext.js           # Global State (Business Config, User Session)
│   └── OrderContext.js         # POS Specific State (Cart logic)
├── hooks/                      # Custom React Hooks (useInventory, useOrders)
├── lib/
│   ├── db.js                   # Prisma/Mongoose Database Connection
│   ├── utils.js                # Formatter (Currency, Date, Calculations)
│   └── validations.js          # Zod/Joi Schemas for Data Integrity
├── public/
│   ├── branding/               # Logos & Favicons
│   └── icons/                  # Custom SVG Icons
├── .env                        # Environment Variables (Secrets)
├── package.json                # Project Dependencies & Scripts
└── README.md                   # Project Documentation
✨ Core Modules & MVP Features
1. 🛒 Unified POS & Hybrid Order Engine
Hybrid Modes: Instant toggle between Online Order and Offline Sell.

Dynamic Invoicing: Real-time PDF generation and PNG image export for social sharing.

Order Tracking: Track orders from "Pending" to "Delivered" with payment reconciliation.

2. 💰 Live Financial Intelligence (Accounting)
Net Profit Engine: Automatic calculation of profit after COGS, discounts, and courier fees.

Receivable Ledger: Clear view of current cash-in-hand vs. customer dues.

Decision Support: Data-driven insights on daily and monthly growth.

3. 📦 Smart Inventory & Stock Control
Auto-Sync: Real-time stock deduction upon sale and addition upon returns.

Valuation Tracking: Total asset value calculation based on cost prices.

Alert System: Low stock notifications to prevent missed sales.

4. 📈 Marketing & Ad-Spend Control (Future Ready)
ROAS Tracking: Input daily Facebook/Google ad costs to see exact profit ratios.

Content Library: Manage product media and captions for social media posting.

🛠 Tech Stack
Framework: Next.js 14+ (App Router)

Database: MongoDB / PostgreSQL (via Prisma)

State: TanStack Query (React Query) & Context API

Styling: Tailwind CSS

Utilities: html-to-image, Lucide Icons, Framer Motion
