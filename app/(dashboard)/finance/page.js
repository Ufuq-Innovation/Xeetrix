"use client";
import React from 'react';
import { useApp } from "@/context/AppContext";

export default function FinancePage() {
  const { t } = useApp();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
        {t.finance || "Finance Control"}
      </h1>
      <p className="text-slate-500 mt-4 font-bold">আয়-ব্যয়ের হিসাব মডিউল শীঘ্রই আসছে...</p>
    </div>
  );
}