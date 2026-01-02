# Xeetrix - The Ultimate E-commerce Management & Automation OS

**Xeetrix** is a high-performance, Next.js-based enterprise solution designed to streamline e-commerce operations. It bridges the gap between complex business data and seamless automation, allowing entrepreneurs to manage their inventory, orders, and finances with Islamic business values and modern efficiency.

---

## 🚀 Vision
To empower e-commerce businesses by automating repetitive tasks, ensuring data accuracy, and providing a bird's-eye view of business health—all within a single, secure dashboard.

## 🛠️ Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Prisma](https://www.prisma.io/) with PostgreSQL/MongoDB
- **Automation:** [Make.com](https://www.make.com/) Integration
- **Authentication:** [Clerk](https://clerk.com/) / NextAuth.js
- **Deployment:** [Vercel](https://vercel.com/)

---

## ✨ Key Features

### 📊 Intelligent Dashboard
- **Real-time Analytics:** Track daily sales, profit margins, and expenses at a glance.
- **Inventory Management:** Smart stock tracking with "Low Stock" alerts.

### 🤖 Automation Engine (Powered by Make.com)
- **Auto-Invoicing:** Generates and sends PDF invoices to customers via Email/WhatsApp upon order confirmation.
- **Order Sync:** Seamlessly syncs data between the website, Google Sheets, and Notion.
- **Notification System:** Automatic SMS/Email updates for order status changes.

### ⚖️ Ethical Finance Module
- **Profit/Loss Tracker:** Calculates net profit by factoring in ad costs, shipping, and product sourcing.
- **Islamic Business Compliance:** Tools to manage business transparently and fairly.

---

## 📁 Project Structure (Evolution from Trading Journal)
```text
xeetrix-os/
├── app/
│   ├── (auth)/             # Login/Signup pages
│   ├── (dashboard)/        # Main Sidebar based app
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── layout.js       # Global Sidebar and Multi-language support
│   ├── api/                # All backend logic
├── components/             # Reusable UI (Sidebar, Navbar, Cards)
├── context/                # State management (Language, Theme, Auth)
├── lib/                    # Config files (MongoDB, Utility functions)
├── models/                 # Database Schemas
├── public/                 # Assets (Images, Icons)