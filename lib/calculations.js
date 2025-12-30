export function calculateTradeStats(data) {
  const { entryPrice, exitPrice, lotSize, direction, sl, tp, entryDate, exitDate } = data;
  
  // PnL Calculation
  const multiplier = 100; // Crypto/Stock এর জন্য ১, Forex এর জন্য ১০০০০০
  let pnl = 0;
  if (direction === 'Buy') {
    pnl = (exitPrice - entryPrice) * lotSize * multiplier;
  } else {
    pnl = (entryPrice - exitPrice) * lotSize * multiplier;
  }

  // ১. Close Type নির্ধারণ
  let closeType = "Manual";
  if (direction === 'Buy') {
    if (exitPrice >= tp && tp > 0) closeType = "TP Hit";
    else if (exitPrice <= sl && sl > 0) closeType = "SL Hit";
  } else {
    if (exitPrice <= tp && tp > 0) closeType = "TP Hit";
    else if (exitPrice >= sl && sl > 0) closeType = "SL Hit";
  }

  // ২. Session নির্ধারণ (UTC সময় অনুযায়ী)
  const hour = new Date(entryDate).getUTCHours();
  let session = "Asia";
  if (hour >= 7 && hour < 13) session = "London";
  else if (hour >= 13 && hour < 21) session = "New York";

  // ৩. RRR Calculation
  let rrr = 0;
  if (sl && Math.abs(entryPrice - sl) !== 0) {
    rrr = Math.abs(exitPrice - entryPrice) / Math.abs(entryPrice - sl);
  }

  // ৪. Duration
  const diff = new Date(exitDate) - new Date(entryDate);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  return { 
    pnl: Number(pnl.toFixed(2)), 
    status: pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven', 
    rrr: Number(rrr.toFixed(2)), 
    duration: `${hours}h ${minutes}m`,
    session,
    closeType
  };
}
