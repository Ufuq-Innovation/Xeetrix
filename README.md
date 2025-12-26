# 🚀 Xeetrix - The Ultimate Trading Journal

**Xeetrix** একটি আধুনিক এবং শক্তিশালী ট্রেডিং জার্নাল ওয়েব অ্যাপ্লিকেশন, যা বিশেষভাবে ফরেক্স, ক্রিপ্টো এবং স্টক ট্রেডারদের জন্য ডিজাইন করা হয়েছে। এটি ট্রেডারদের তাদের ট্রেডিং পারফরম্যান্স ট্র্যাক করতে, লজিক্যাল অ্যানালিটিক্স দেখতে এবং ট্রেডিং সাইকোলজি উন্নত করতে সাহায্য করে।

---

## 🛠 টেকনোলজি স্ট্যাক (Tech Stack)

Xeetrix-এর আর্কিটেকচার তৈরি করা হয়েছে আধুনিক এবং স্কেলেবল টেকনোলজি দিয়ে:

- **Frontend:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
- **Backend:** Next.js API Routes (Serverless)
- **Database:** [MongoDB](https://www.mongodb.com/) with Mongoose ODM
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (Planned)
- **Charts:** [Recharts](https://recharts.org/) / [Chart.js](https://www.chartjs.org/)

---

## 📂 প্রজেক্ট আর্কিটেকচার (Folder Structure)

প্রজেক্টটি **Clean Architecture** মেইনটেইন করে সাজানো হয়েছে:

```text
xeetrix/
├── app/                  # Frontend Pages & Backend API Routes
│   ├── api/              # API Endpoints (trades, users, stats)
│   ├── dashboard/        # Main Dashboard UI
│   └── layout.js         # Global Layout & Providers
├── models/               # MongoDB Schemas (Trade, User)
├── components/           # Reusable UI Components
│   ├── ui/               # Base Components (Buttons, Inputs)
│   ├── trades/           # Trade specific components (Forms, Tables)
│   └── charts/           # Analytics & Performance Charts
├── lib/                  # Configurations & Helper Logic
│   ├── mongodb.js        # MongoDB Connection Pooling
│   ├── calculations.js   # P&L, RRR & Duration Logic
│   └── utils.js          # Tailwind Merge & Utility functions
├── services/             # API Client logic for frontend
└── public/               # Static assets (Logo, Icons)
