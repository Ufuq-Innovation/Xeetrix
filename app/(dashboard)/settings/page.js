"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from "@/context/AppContext";
import { Settings, Globe, Building2, User, Save, Sun, Moon, Monitor, Coins } from 'lucide-react';
import { toast } from "sonner";

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
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
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
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
  { code: 'ILS', symbol: '₪', name: 'Israeli New Shekel' },
  { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'TWD', symbol: 'NT$', name: 'New Taiwan Dollar' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
  { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar' },
  { code: 'JOD', symbol: 'JD', name: 'Jordanian Dinar' },
  { code: 'LBP', symbol: 'L£', name: 'Lebanese Pound' },
  { code: 'IQD', symbol: 'ID', name: 'Iraqi Dinar' },
  { code: 'AZN', symbol: '₼', name: 'Azerbaijani Manat' },
  { code: 'KZT', symbol: '₸', name: 'Kazakhstani Tenge' },
  { code: 'UZS', symbol: "so'm", name: 'Uzbekistani Som' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu' },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev' },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Krona' },
  { code: 'HRK', symbol: 'kn', name: 'Croatian Kuna' },
  { code: 'RSD', symbol: 'дин.', name: 'Serbian Dinar' },
  { code: 'ALL', symbol: 'L', name: 'Albanian Lek' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari' },
  { code: 'AMD', symbol: '֏', name: 'Armenian Dram' },
  { code: 'BYN', symbol: 'Br', name: 'Belarusian Ruble' },
  { code: 'TJS', symbol: 'SM', name: 'Tajikistani Somoni' },
  { code: 'TMT', symbol: 'm', name: 'Turkmenistani Manat' },
  { code: 'KGS', symbol: 'с', name: 'Kyrgyzstani Som' },
  { code: 'MNT', symbol: '₮', name: 'Mongolian Tugrik' },
  { code: 'KHR', symbol: '៛', name: 'Cambodian Riel' },
  { code: 'LAK', symbol: '₭', name: 'Laotian Kip' },
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
  { code: 'YER', symbol: '﷼', name: 'Yemeni Rial' },
  { code: 'SYP', symbol: '£', name: 'Syrian Pound' },
  { code: 'SDG', symbol: 'ج.س.', name: 'Sudanese Pound' },
  { code: 'MUR', symbol: '₨', name: 'Mauritian Rupee' },
  { code: 'SCR', symbol: '₨', name: 'Seychellois Rupee' },
  { code: 'ETB', symbol: 'Br', name: 'Ethiopian Birr' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'RWF', symbol: 'FRw', name: 'Rwandan Franc' },
  { code: 'MWK', symbol: 'MK', name: 'Malawian Kwacha' },
  { code: 'ZMW', symbol: 'ZK', name: 'Zambian Kwacha' },
  { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
  { code: 'NAD', symbol: 'N$', name: 'Namibian Dollar' },
  { code: 'MZN', symbol: 'MT', name: 'Mozambican Metical' },
  { code: 'AOA', symbol: 'Kz', name: 'Angolan Kwanza' },
  { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA Franc' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA Franc' },
  { code: 'PAB', symbol: 'B/.', name: 'Panamanian Balboa' },
  { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
  { code: 'DOP', symbol: 'RD$', name: 'Dominican Peso' },
  { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
  { code: 'HNL', symbol: 'L', name: 'Honduran Lempira' },
  { code: 'NIO', symbol: 'C$', name: 'Nicaraguan Córdoba' },
  { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' },
  { code: 'UYU', symbol: '$U', name: 'Uruguayan Peso' },
  { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },
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
    updateCurrency(selected);
    toast.success(`Currency set to ${selected.code}`);
  };

  const handleSave = async () => {
    setLoading(true);
    const toastId = toast.loading(t('syncing'));
    try {
      // Logic for saving other profile data can go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(t('settings_saved_success'), { id: toastId });
    } catch (error) {
      toast.error(t('something_went_wrong'), { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 p-4 md:p-0">
      <header>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
          <Settings size={40} className="text-blue-500" />
          {t('settings')}
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#11161D] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-8 shadow-2xl">
            <section className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                <Building2 size={16} /> {t('business_profile')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">{t('business_name')}</label>
                  <input
                    className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    value={profile.businessName}
                    onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">{t('currency')}</label>
                  <div className="relative">
                    <select
                      className="w-full bg-slate-50 dark:bg-[#090E14] p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:border-blue-500 appearance-none"
                      value={currency.code}
                      onChange={handleCurrencyChange}
                    >
                      {currencies.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} ({c.symbol}) - {c.name}
                        </option>
                      ))}
                    </select>
                    <Coins size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-6 border-t border-slate-100 dark:border-white/5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
                <User size={16} /> {t('identity_access')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  value={profile.owner}
                  onChange={(e) => setProfile({ ...profile, owner: e.target.value })}
                />
                <input
                  type="email"
                  className="w-full bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
            </section>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-[#11161D] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2 mb-6">
              <Sun size={16} /> {t('theme')}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'light', icon: Sun, label: 'light_mode' },
                { id: 'dark', icon: Moon, label: 'dark_mode' },
                { id: 'system', icon: Monitor, label: 'system_default' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleTheme(item.id)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                    theme === item.id 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-500' 
                    : 'border-transparent bg-slate-50 dark:bg-white/5 text-slate-400'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="text-[9px] font-black uppercase tracking-tighter">{t(item.label)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Language Selection */}
          <div className="bg-white dark:bg-[#11161D] p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6 shadow-xl max-h-[600px] overflow-y-auto no-scrollbar">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Globe size={16} /> {t('localization')}
            </h3>
            {languages.map(item => (
              <button
                key={item.code}
                onClick={() => toggleLang(item.code)}
                className={`w-full p-4 rounded-xl text-[10px] uppercase font-black flex justify-between transition-all ${
                  lang === item.code ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                }`}
              >
                <span>{item.name}</span>
                <span>{item.flag}</span>
              </button>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 p-6 rounded-[2rem] font-black uppercase tracking-widest text-white disabled:bg-slate-800 flex items-center justify-center gap-3 transition-transform active:scale-95 shadow-2xl shadow-blue-500/30"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
            {loading ? t('syncing') : t('save_settings')}
          </button>
        </div>
      </div>
    </div>
  );
}