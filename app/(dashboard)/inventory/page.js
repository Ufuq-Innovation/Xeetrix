"use client";
import React from 'react';
import { useApp } from "@/context/AppContext";

export default function InventoryPage() {
  const { t } = useApp();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white">
        {t.inventory || "Inventory Management"}
      </h1>
      <p className="text-slate-500 mt-4 font-bold">ইনভেন্টরি বা স্টক মডিউল শীঘ্রই আসছে...</p>
    </div>
  );
}