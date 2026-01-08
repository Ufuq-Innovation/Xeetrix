"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { 
  Settings, Globe, Building2, User, Save, Sun, Moon, 
  Monitor, Coins, Mail, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { toast } from "sonner";

const currencies = [
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AFN', symbol: '؋', name: 'Afghan Afghani' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Rial' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'BHD', symbol: '.د.ব', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
  { code: 'LBP', symbol: 'L£', name: 'Lebanese Pound' },
  { code: 'IQD', symbol: 'ID', name: 'Iraqi Dinar' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'SDG', symbol: 'ج.স.', name: 'Sudanese Pound' },
];

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ur', name: 'اردو', flag: '🇵🇰' },
  { code: 'ps', name: 'پښتو', flag: '🇦🇫' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

export default function SettingsPage() {
  const { lang, toggleLang, theme, toggleTheme, currency, updateCurrency } = useApp();
  const { t } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    businessName: "Xeetrix E-commerce",
    owner: "Shaikh Baset",
    email: "admin@xeetrix.com",
  });

  const handleCurrencyChange = (e) => {
    const selected = currencies.find(c => c.code === e.target.value);
    if (selected) {
      updateCurrency(selected);
      toast.success(`${t('currency_updated') || 'Currency updated'} to ${selected.code}`);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading(t('syncing') || 'Syncing...');
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('settings_saved_success') || 'Settings saved successfully!', { id: toastId });
    } catch (error) {
      toast.error(t('error_saving') || 'Failed to save', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 md:space-y-12 pb-24 px-4 sm:px-6">
      {/* Dynamic Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-[#11161D] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm transition-all">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-blue-600 rounded-2xl md:rounded-3xl shadow-xl shadow-blue-500/20">
            <Settings size={28} className="text-white md:w-8 md:h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
              {t('settings')}
            </h1>
            <p className="hidden sm:block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{t('control_room_config')}</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
          <span className="text-sm md:text-base">{loading ? t('syncing') : t('save_settings')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-8 space-y-8 order-2 xl:order-1">
          {/* Business Profile Section */}
          <section className="bg-white dark:bg-[#11161D] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Building2 size={16} /> {t('business_profile')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('business_name')}</label>
                <input
                  className="w-full bg-slate-50 dark:bg-[#090E14] p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none transition-all"
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('currency')}</label>
                <div className="relative">
                  <select
                    className="w-full bg-slate-50 dark:bg-[#090E14] p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold appearance-none outline-none cursor-pointer"
                    value={currency.code}
                    onChange={handleCurrencyChange}
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                    ))}
                  </select>
                  <Coins size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('owner_name')}</label>
                <div className="relative group">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    className="w-full bg-slate-50 dark:bg-[#090E14] pl-12 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none"
                    value={profile.owner}
                    onChange={(e) => setProfile({ ...profile, owner: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t('email_address')}</label>
                <div className="relative group">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    className="w-full bg-slate-50 dark:bg-[#090E14] pl-12 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold focus:border-blue-500 outline-none"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Theme Mode Selection */}
          <section className="bg-white dark:bg-[#11161D] p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Sun size={16} /> {t('appearance')}
            </h3>
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
              {[
                { id: 'light', icon: Sun, label: 'light' },
                { id: 'dark', icon: Moon, label: 'dark' },
                { id: 'system', icon: Monitor, label: 'system' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTheme(item.id)}
                  className={`flex items-center justify-center xs:flex-col p-4 md:p-6 rounded-2xl border-2 transition-all gap-3 ${
                    theme === item.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600' 
                    : 'border-transparent bg-slate-50 dark:bg-[#090E14] text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon size={20} className="md:w-6 md:h-6" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t(item.label)}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Language List */}
        <div className="xl:col-span-4 order-1 xl:order-2">
          <section className="bg-white dark:bg-[#11161D] p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm space-y-6 xl:sticky xl:top-8 max-h-[500px] xl:max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Globe size={16} /> {t('localization')}
            </h3>
            <div className="space-y-2 overflow-y-auto no-scrollbar pr-1 flex-grow">
              {languages.map(item => (
                <button
                  key={item.code}
                  onClick={() => toggleLang(item.code)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group ${
                    lang === item.code 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                    : 'bg-slate-50 dark:bg-[#090E14] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl flag-emoji leading-none group-hover:scale-110 transition-transform">
                      {item.flag}
                    </span>
                    <span className="font-bold text-sm uppercase tracking-tight">{item.name}</span>
                  </div>
                  {lang === item.code && <CheckCircle2 size={18} className="text-white" />}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}