export function calculateTradeStats(data) {
  const { symbol, entryPrice, exitPrice, lotSize, direction, sl, tp, entryDate, exitDate, manualCloseType } = data;
  
  // ১. ডাইনামিক মাল্টিপ্লায়ার
  let multiplier = 1;
  const asset = symbol.toUpperCase();
  if (asset.includes("XAU") || asset.includes("GOLD")) multiplier = 100;
  else if (asset.length === 6) multiplier = 100000;

  // ২. PnL ক্যালকুলেশন
  const pnl = direction === 'Buy' 
    ? (Number(exitPrice) - Number(entryPrice)) * Number(lotSize) * multiplier
    : (Number(entryPrice) - Number(exitPrice)) * Number(lotSize) * multiplier;

  // ৩. স্মার্ট ক্লোজ টাইপ (User Choice + Auto Detection)
  let closeType = manualCloseType || "Manual"; 
  const exitP = Number(exitPrice);
  const tpP = Number(tp);
  const slP = Number(sl);

  // যদি ইউজার "Auto-Detect" সিলেক্ট করে রাখে, তবেই আমরা TP/SL চেক করব
  if (!manualCloseType || manualCloseType === "") {
    if (direction === 'Buy') {
      if (tpP > 0 && exitP >= tpP) closeType = "TP Hit";
      else if (slP > 0 && exitP <= slP) closeType = "SL Hit";
    } else {
      if (tpP > 0 && exitP <= tpP) closeType = "TP Hit";
      else if (slP > 0 && exitP >= slP) closeType = "SL Hit";
    }
  }

  // ৪. সেশন ক্যালকুলেশন (UTC)
  const hour = new Date(entryDate).getUTCHours();
  let session = "Asia";
  if (hour >= 7 && hour < 13) session = "London";
  else if (hour >= 13 && hour < 21) session = "New York";

  // ৫. RRR এবং Duration
  let rrr = 0;
  const risk = Math.abs(Number(entryPrice) - Number(sl));
  if (risk > 0) rrr = Math.abs(Number(exitPrice) - Number(entryPrice)) / risk;

  const diff = new Date(exitDate) - new Date(entryDate);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  return { 
    pnl: Number(pnl.toFixed(2)), 
    status: pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven',
    rrr: Number(rrr.toFixed(2)),
    duration: `${hours}h ${mins}m`,
    session,
    closeType
  };
}
