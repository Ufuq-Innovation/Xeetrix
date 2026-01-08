// ADD TO EXISTING CODE - Place this after the current KPI section (around line 110)

{/* Advanced KPI Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
  {/* Total Orders */}
  <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 p-6 rounded-3xl border border-blue-500/20 shadow-lg shadow-blue-500/10 transition-all hover:shadow-blue-500/20 hover:border-blue-500/30 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-500/20 rounded-2xl">
        <ShoppingBag className="text-blue-500" size={24} />
      </div>
      <span className="text-[10px] font-bold px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full">
        {t('today')}
      </span>
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
      {t('total_orders')}
    </h4>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold opacity-50">{currency}</span>
      <p className="text-4xl font-black italic text-white">
        {(dashboardData?.summary?.totalOrders ?? 0).toLocaleString()}
      </p>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <TrendingUp size={14} className="text-emerald-500" />
      <span className="text-[10px] font-bold text-emerald-500">
        +{(dashboardData?.trends?.orderGrowth ?? 0)}% {t('from_last_month')}
      </span>
    </div>
  </div>

  {/* Average Order Value */}
  <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 p-6 rounded-3xl border border-purple-500/20 shadow-lg shadow-purple-500/10 transition-all hover:shadow-purple-500/20 hover:border-purple-500/30 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-purple-500/20 rounded-2xl">
        <CreditCard className="text-purple-500" size={24} />
      </div>
      <span className="text-[10px] font-bold px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full">
        {t('avg')}
      </span>
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
      {t('average_order_value')}
    </h4>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold opacity-50">{currency}</span>
      <p className="text-4xl font-black italic text-white">
        {(dashboardData?.summary?.averageOrderValue ?? 0).toLocaleString()}
      </p>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <ArrowUpRight size={14} className="text-blue-500" />
      <span className="text-[10px] font-bold text-blue-500">
        {t('per_transaction')}
      </span>
    </div>
  </div>

  {/* Conversion Rate */}
  <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 p-6 rounded-3xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10 transition-all hover:shadow-emerald-500/20 hover:border-emerald-500/30 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-emerald-500/20 rounded-2xl">
        <TrendingUp className="text-emerald-500" size={24} />
      </div>
      <span className="text-[10px] font-bold px-3 py-1 bg-emerald-500/20 text-emerald-500 rounded-full">
        {t('rate')}
      </span>
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
      {t('conversion_rate')}
    </h4>
    <p className="text-4xl font-black italic text-white">
      {(dashboardData?.summary?.conversionRate ?? 0).toFixed(1)}%
    </p>
    <div className="mt-4 flex items-center gap-2">
      <Activity size={14} className="text-emerald-500" />
      <span className="text-[10px] font-bold text-emerald-500">
        {(dashboardData?.trends?.conversionChange ?? 0) > 0 ? '+' : ''}
        {(dashboardData?.trends?.conversionChange ?? 0)}% {t('trend')}
      </span>
    </div>
  </div>

  {/* Cash in Hand */}
  <div className="bg-gradient-to-br from-amber-500/10 to-amber-900/5 p-6 rounded-3xl border border-amber-500/20 shadow-lg shadow-amber-500/10 transition-all hover:shadow-amber-500/20 hover:border-amber-500/30 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-amber-500/20 rounded-2xl">
        <CreditCard className="text-amber-500" size={24} />
      </div>
      <span className="text-[10px] font-bold px-3 py-1 bg-amber-500/20 text-amber-500 rounded-full">
        {t('available')}
      </span>
    </div>
    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
      {t('cash_in_hand')}
    </h4>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold opacity-50">{currency}</span>
      <p className="text-4xl font-black italic text-white">
        {(dashboardData?.summary?.cashInHand ?? 0).toLocaleString()}
      </p>
    </div>
    <div className="mt-4 flex items-center gap-2">
      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
      <span className="text-[10px] font-bold text-amber-500">
        {t('real_time_balance')}
      </span>
    </div>
  </div>
</div>

{/* Performance Metrics Row */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
  {/* Pending Orders */}
  <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 p-6 rounded-3xl border border-white/5">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
        {t('pending_orders')}
      </h4>
      <span className="text-[10px] font-bold px-3 py-1 bg-red-500/20 text-red-500 rounded-full">
        {(dashboardData?.statusCounts?.pending ?? 0)}
      </span>
    </div>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{t('cod_pending')}</span>
        <span className="font-bold text-white">
          {currency}{(dashboardData?.summary?.codPending ?? 0).toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{t('processing')}</span>
        <span className="font-bold text-blue-500">
          {(dashboardData?.statusCounts?.processing ?? 0)}
        </span>
      </div>
    </div>
  </div>

  {/* Quick Stats */}
  <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 p-6 rounded-3xl border border-white/5">
    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">
      {t('quick_stats')}
    </h4>
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
          {t('products')}
        </p>
        <p className="text-2xl font-black text-white">
          {(dashboardData?.summary?.totalProducts ?? 0).toLocaleString()}
        </p>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
          {t('customers')}
        </p>
        <p className="text-2xl font-black text-white">
          {(dashboardData?.summary?.totalCustomers ?? 0).toLocaleString()}
        </p>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
          {t('low_stock')}
        </p>
        <p className="text-2xl font-black text-amber-500">
          {(dashboardData?.alerts?.lowStockCount ?? 0)}
        </p>
      </div>
      <div className="text-center p-4 bg-white/5 rounded-2xl">
        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2">
          {t('returns')}
        </p>
        <p className="text-2xl font-black text-red-500">
          {(dashboardData?.statusCounts?.returned ?? 0)}
        </p>
      </div>
    </div>
  </div>

  {/* Recent Activity */}
  <div className="bg-gradient-to-br from-slate-800 to-slate-900/50 p-6 rounded-3xl border border-white/5">
    <div className="flex items-center justify-between mb-6">
      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
        {t('recent_activity')}
      </h4>
      <span className="text-[10px] font-bold text-blue-500">
        {t('live')}
      </span>
    </div>
    <div className="space-y-4">
      {(dashboardData?.recentActivity || []).slice(0, 3).map((activity, idx) => (
        <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
          <div className={`p-2 rounded-lg ${idx === 0 ? 'bg-blue-500/20' : idx === 1 ? 'bg-emerald-500/20' : 'bg-purple-500/20'}`}>
            <ShoppingBag size={16} className={idx === 0 ? 'text-blue-500' : idx === 1 ? 'text-emerald-500' : 'text-purple-500'} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{activity.description}</p>
            <p className="text-[10px] font-bold text-slate-400">{activity.time}</p>
          </div>
          <span className="text-xs font-bold text-slate-300">
            {currency}{activity.amount?.toLocaleString()}
          </span>
        </div>
      ))}
      {(dashboardData?.recentActivity || []).length === 0 && (
        <p className="text-center text-slate-400 py-4">{t('no_recent_activity')}</p>
      )}
    </div>
  </div>
</div>