// POE2 Purchase History — Popup Script

const CURRENCY_DISPLAY = {
  divine: 'Divine', chaos: 'Chaos', exalted: 'Exalted',
  mirror: 'Mirror', gold: 'Gold', vaal: 'Vaal',
  alch: 'Alch', fusing: 'Fusing',
};

async function loadStats() {
  const result = await chrome.storage.local.get('poe2ph_purchases');
  const purchases = result.poe2ph_purchases || [];

  // Total
  document.getElementById('stat-total').textContent = purchases.length;

  // Today
  const today = new Date().toDateString();
  const todayCount = purchases.filter(p => new Date(p.timestamp).toDateString() === today).length;
  document.getElementById('stat-today').textContent = todayCount;

  // Last purchase
  const lastItem = document.getElementById('popup-last-item');
  if (purchases.length > 0) {
    const p    = purchases[0];
    const date = new Date(p.timestamp);
    const ds   = date.toLocaleDateString();
    const ts   = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const curr = CURRENCY_DISPLAY[p.price?.currency] || p.price?.currency || '?';

    lastItem.innerHTML = `
      <div class="popup-last-name" title="${escHtml(p.itemName)}">${escHtml(p.itemName)}</div>
      <div class="popup-last-meta">
        <span class="popup-last-price">${p.price?.amount} ${curr}</span>
        <span class="popup-last-date">${ds} ${ts}</span>
      </div>
    `;
  }
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

loadStats().catch(console.error);
