export const calculateTradeStats = (data) => {
  const { symbol, direction, entryPrice, exitPrice, lotSize, sl, entryDate, exitDate } = data;

  // ১. কন্ট্রাক্ট সাইজ নির্ধারণ
  let unitPerLot = 1;
  const pair = symbol.toUpperCase();
  if (pair.includes("USD") && pair.length === 6) unitPerLot = 100000; // Forex
  if (pair.includes("XAU") || pair.includes("GOLD")) unitPerLot = 100; // Gold

  const contractSize = unitPerLot * lotSize;

  // ২. P&L ক্যালকুলেশন
  const diff = direction === 'Buy' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
  const pnl = Number((diff * contractSize).toFixed(2));

  // ৩. Status নির্ধারণ
  const status = pnl > 0 ? 'Win' : (pnl < 0 ? 'Loss' : 'Breakeven');

  // ৪. RRR ক্যালকুলেশন
  let rrr = 0;
  if (sl) {
    const risk = Math.abs(entryPrice - sl);
    const reward = Math.abs(exitPrice - entryPrice);
    rrr = risk > 0 ? Number((reward / risk).toFixed(2)) : 0;
  }

  // ৫. Duration ক্যালকুলেশন
  const durationMs = new Date(exitDate) - new Date(entryDate);
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = `${hours}h ${minutes}m`;

  return { pnl, status, rrr, duration };
};