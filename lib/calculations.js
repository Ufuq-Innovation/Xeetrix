export function calculateTradeStats(data) {
  const { entryPrice, exitPrice, lotSize, direction, sl, entryDate, exitDate } = data;
  
  // PnL Calculation (Change 100 to 100000 for Forex Pips)
  const multiplier = 100; 
  let pnl = 0;
  if (direction === 'Buy') {
    pnl = (exitPrice - entryPrice) * lotSize * multiplier;
  } else {
    pnl = (entryPrice - exitPrice) * lotSize * multiplier;
  }

  const status = pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven';

  // RRR Calculation
  let rrr = 0;
  if (sl && Math.abs(entryPrice - sl) !== 0) {
    rrr = Math.abs(exitPrice - entryPrice) / Math.abs(entryPrice - sl);
  }

  // Duration
  const diff = new Date(exitDate) - new Date(entryDate);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const duration = `${hours}h ${minutes}m`;

  return { pnl: Number(pnl.toFixed(2)), status, rrr: Number(rrr.toFixed(2)), duration };
}