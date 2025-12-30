export function calculateTradeStats(data) {
  const { symbol, entryPrice, exitPrice, lotSize, direction, sl, tp, entryDate, exitDate } = data;
  
  // ১. ডাইনামিক মাল্টিপ্লায়ার (Gold/XAU = 100, Forex = 100000, Crypto = 1)
  let multiplier = 1;
  const asset = symbol.toUpperCase();
  if (asset.includes("XAU") || asset.includes("GOLD")) multiplier = 100;
  else if (asset.length === 6) multiplier = 100000; // Standard Forex pairs

  let pnl = direction === 'Buy' 
    ? (Number(exitPrice) - Number(entryPrice)) * Number(lotSize) * multiplier
    : (Number(entryPrice) - Number(exitPrice)) * Number(lotSize) * multiplier;

  // ২. ক্লোজ টাইপ নির্ধারণ
  let closeType = "Manual";
  if (direction === 'Buy') {
    if (tp > 0 && exitPrice >= tp) closeType = "TP Hit";
    else if (sl > 0 && exitPrice <= sl) closeType = "SL Hit";
  } else {
    if (tp > 0 && exitPrice <= tp) closeType = "TP Hit";
    else if (sl > 0 && exitPrice >= sl) closeType = "SL Hit";
  }

  // ৩. সেশন নির্ধারণ (UTC)
  const hour = new Date(entryDate).getUTCHours();
  let session = "Asia";
  if (hour >= 7 && hour < 13) session = "London";
  else if (hour >= 13 && hour < 21) session = "New York";

  // ৪. RRR
  let rrr = 0;
  const risk = Math.abs(Number(entryPrice) - Number(sl));
  if (risk > 0) rrr = Math.abs(Number(exitPrice) - Number(entryPrice)) / risk;

  // ৫. ডিউরেশন
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
