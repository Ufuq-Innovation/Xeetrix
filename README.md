trading-journal-web/
├── .github/                # GitHub Actions (ভবিষ্যতে CI/CD এর জন্য)
├── app/                    # Next.js App Router (Frontend & API)
│   ├── api/                # Backend API Routes
│   │   ├── trades/         # /api/trades (GET/POST)
│   │   │   └── route.js
│   │   └── auth/           # Authentication Routes
│   ├── dashboard/          # ড্যাশবোর্ড পেজসমূহ
│   ├── layout.js           # গ্লোবাল লেআউট
│   └── page.js             # ল্যান্ডিং পেজ
├── components/             # UI কম্পোনেন্টস
│   ├── dashboard/          # ড্যাশবোর্ড স্পেসিফিক কম্পোনেন্ট (Stats, Charts)
│   ├── trades/             # ট্রেড রিলেটেড কম্পোনেন্ট (Form, Table)
│   └── ui/                 # বেসিক UI এলিমেন্ট (Button, Input - shadcn style)
├── lib/                    # শেয়ারড কনফিগারেশন ও লজিক
│   ├── mongodb.js          # MongoDB সংযোগ লজিক
│   ├── calculations.js     # P&L, RRR হিসাব করার গাণিতিক ফাংশন
│   └── utils.js            # হেল্পার ফাংশন
├── models/                 # MongoDB (Mongoose) স্কিমা/মডেল
│   ├── Trade.js            # ট্রেড ডাটা মডেল
│   └── User.js             # ইউজার ডাটা মডেল
├── public/                 # স্ট্যাটিক অ্যাসেট (ইমেজ, আইকন)
├── styles/                 # গ্লোবাল CSS
├── .env.example            # এনভায়রনমেন্ট ভেরিয়েবল টেমপ্লেট
├── .gitignore              # গিট ইগনোর ফাইল
├── next.config.js          # Next.js কনফিগারেশন
├── package.json            # ডিপেন্ডেন্সি লিস্ট
└── README.md               # প্রজেক্ট ডকুমেন্টেশন
