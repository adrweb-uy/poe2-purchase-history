/* eslint-disable */
// ============================================================
//  POE2 Purchase History — Content Script
//  Injects a side panel into pathofexile.com/trade2
// ============================================================

(function () {
  'use strict';

  // Prevent double-injection on SPA navigation events
  if (window.__poe2ph_initialized) return;
  window.__poe2ph_initialized = true;

  // ============================================================
  //  CONSTANTS
  // ============================================================

  /** "Travel to Hideout" button text in all supported languages */
  const TRAVEL_TEXTS = new Set([
    'Travel to Hideout',       // EN
    'Viajar al Escondite',     // ES
    'Viajar para o Esconderijo', // PT
    'Zum Versteck reisen',     // DE
    'Voyager vers la Cachette', // FR
    'Перейти в убежище',       // RU
    'ハイドアウトへ移動',         // JA
    '은신처로 이동',              // KO
  ]);

  const CATEGORY_ICONS = {
    weapon: '⚔️', armor: '🛡️', accessory: '💍',
    jewel: '💎', gem: '🔮', currency: '🪙',
    flask: '⚗️', map: '🗺️', other: '📦',
  };

  const CURRENCY_DISPLAY = {
    divine: 'Divine', chaos: 'Chaos', exalted: 'Exalted',
    mirror: 'Mirror', gold: 'Gold', vaal: 'Vaal',
    alch: 'Alch', fusing: 'Fusing', alteration: 'Alt',
  };

  // ============================================================
  //  TRANSLATIONS  (EN + ES inline for MVP)
  // ============================================================

  const TRANSLATIONS = {
    en: {
      appName:    'POE2 Purchase History',
      appSubtitle: 'Trade Companion',
      tabs: { history: 'History', settings: 'Settings' },
      history: {
        empty:     'No purchases recorded yet.',
        emptyHint: "Click 'Travel to Hideout' on any trade result to record a purchase automatically.",
        seller:    'Seller', price: 'Price', league: 'League',
        notes:     'Add a note…', delete: 'Delete',
        category:  'Category', searchUrl: 'Search URL',
        openSearch: 'Open search',
      },
      settings: {
        language:          'Language',
        languageDesc:      'Choose the language for the extension interface.',
        panelPosition:     'Panel Position',
        panelPositionDesc: 'Choose which side of the screen the panel appears on.',
        left: 'Left', right: 'Right', reset: 'Reset',
        export:     'Export History',
        exportDesc: 'Export your purchase history as a JSON file.',
        exportBtn:  'Export JSON',
        clearHistory: 'Clear History',
        clearHistoryDesc: 'Permanently delete all recorded purchases.',
        clearBtn:     'Clear All',
        clearConfirm: 'Are you sure? This cannot be undone.',
      },
      categories: {
        weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory',
        jewel: 'Jewel', gem: 'Gem', currency: 'Currency',
        flask: 'Flask', map: 'Map', other: 'Other',
      },
      toast: {
        purchased: '✅ Purchase recorded!',
        deleted:   'Purchase deleted.',
        cleared:   'History cleared.',
        exported:  'History exported.',
      },
    },
    es: {
      appName:    'POE2 Historial de Compras',
      appSubtitle: 'Compañero de Trade',
      tabs: { history: 'Historial', settings: 'Ajustes' },
      history: {
        empty:     'Aún no hay compras registradas.',
        emptyHint: "Hacé clic en 'Viajar al Escondite' en un resultado de trade para registrar la compra.",
        seller:    'Vendedor', price: 'Precio', league: 'Liga',
        notes:     'Agregar nota…', delete: 'Eliminar',
        category:  'Categoría', searchUrl: 'URL de búsqueda',
        openSearch: 'Abrir búsqueda',
      },
      settings: {
        language:          'Idioma',
        languageDesc:      'Elegí el idioma de la interfaz de la extensión.',
        panelPosition:     'Posición del Panel',
        panelPositionDesc: 'Elegí en qué lado de la pantalla aparece el panel.',
        left: 'Izquierda', right: 'Derecha', reset: 'Restablecer',
        export:     'Exportar Historial',
        exportDesc: 'Exportá tu historial de compras como archivo JSON.',
        exportBtn:  'Exportar JSON',
        clearHistory: 'Limpiar Historial',
        clearHistoryDesc: 'Eliminá permanentemente todas las compras registradas.',
        clearBtn:     'Limpiar Todo',
        clearConfirm: '¿Estás seguro? Esta acción no se puede deshacer.',
      },
      categories: {
        weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio',
        jewel: 'Joya', gem: 'Gema', currency: 'Divisa',
        flask: 'Frasco', map: 'Mapa', other: 'Otro',
      },
      toast: {
        purchased: '✅ ¡Compra registrada!',
        deleted:   'Compra eliminada.',
        cleared:   'Historial limpiado.',
        exported:  'Historial exportado.',
      },
    },
    pt: { /* Portuguese stub – falls back to EN */ },
    de: { /* German stub */ },
    fr: { /* French stub */ },
    ru: { /* Russian stub */ },
    ja: { /* Japanese stub */ },
    ko: { /* Korean stub */ },
  };

  // Current locale resolver
  let _lang = 'en';
  function t(path) {
    const keys  = path.split('.');
    let   obj   = TRANSLATIONS[_lang] || TRANSLATIONS.en;
    let   fallback = TRANSLATIONS.en;
    for (const k of keys) {
      obj      = obj?.[k];
      fallback = fallback?.[k];
    }
    return obj || fallback || path;
  }

  // ============================================================
  //  STORAGE
  // ============================================================

  const Storage = {
    async _get(key, def) {
      return new Promise(resolve =>
        chrome.storage.local.get(key, r => resolve(r[key] !== undefined ? r[key] : def)));
    },
    async _set(key, val) {
      return new Promise(resolve => chrome.storage.local.set({ [key]: val }, resolve));
    },
    async getPurchases()         { return this._get('poe2ph_purchases', []); },
    async setPurchases(list)     { return this._set('poe2ph_purchases', list); },
    async getSettings()          { return this._get('poe2ph_settings', { language: 'en', panelPosition: 'right' }); },
    async saveSettings(s)        { return this._set('poe2ph_settings', s); },

    async addPurchase(item) {
      const list = await this.getPurchases();
      list.unshift(item);
      await this.setPurchases(list);
    },
    async deletePurchase(id) {
      const list = await this.getPurchases();
      await this.setPurchases(list.filter(p => p.id !== id));
    },
    async updateNote(id, note) {
      const list = await this.getPurchases();
      const p = list.find(x => x.id === id);
      if (p) { p.notes = note; await this.setPurchases(list); }
    },
    async clearPurchases() { await this.setPurchases([]); },
  };

  // ============================================================
  //  ITEM EXTRACTOR
  // ============================================================

  const Extractor = {
    /** Try to scrape item data from the trade result row that contains the clicked button */
    extract(button) {
      try {
        const row = this._findRow(button);
        return {
          id:        this._uid(),
          timestamp: new Date().toISOString(),
          itemName:  this._name(row),
          category:  this._category(row),
          price:     this._price(row),
          seller:    this._seller(row),
          league:    this._league(),
          searchUrl: window.location.href,
          stats:     this._stats(row),
          imageUrl:  this._image(row),
          notes:     '',
        };
      } catch (e) {
        console.warn('[POE2PH] Extraction error:', e);
        return this._empty();
      }
    },

    _uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
    },

    /** Walk up the DOM looking for a container that has both a price number and some content */
    _findRow(btn) {
      let el = btn?.parentElement;
      for (let depth = 0; depth < 20 && el; depth++) {
        const txt = el.innerText || '';
        const hasPrice = /\d+\s*(divine|chaos|exalted|mirror|gold|vaal|alch)/i.test(txt);
        if (hasPrice && el.querySelectorAll('*').length > 5) return el;
        el = el.parentElement;
      }
      // Aggressive fallback: 8 levels up
      el = btn;
      for (let i = 0; i < 8; i++) el = el?.parentElement;
      return el;
    },

    _name(row) {
      if (!row) return 'Unknown Item';
      // Try attribute-based selectors first
      for (const sel of ['[class*="name"]','[class*="Name"]','[class*="title"]','h3','h4','b','strong']) {
        const el = row.querySelector(sel);
        const txt = el?.textContent?.trim();
        if (txt && txt.length > 2 && txt.length < 120) return txt;
      }
      const lines = (row.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
      return lines[0] || 'Unknown Item';
    },

    _price(row) {
      const txt = row?.innerText || '';
      const m = txt.match(/(\d+(?:[.,]\d+)?)\s*(divine|chaos|exalted|mirror|gold|vaal|alch|fusing|alt(?:eration)?)/i);
      if (m) return { amount: parseFloat(m[1].replace(',', '.')), currency: m[2].toLowerCase() };
      return { amount: 0, currency: 'unknown' };
    },

    _seller(row) {
      if (!row) return 'Unknown';
      // Look for account links
      const link = row.querySelector('a[href*="/account/"]');
      if (link?.textContent?.trim()) return link.textContent.trim();
      // Class-based fallback
      for (const sel of ['[class*="seller"]','[class*="account"]','[class*="Seller"]','[class*="whisper"]']) {
        const el = row.querySelector(sel);
        if (el?.textContent?.trim()) return el.textContent.trim();
      }
      return 'Unknown';
    },

    _league() {
      const m = window.location.href.match(/league=([^&]+)/i);
      if (m) return decodeURIComponent(m[1]);
      const el = document.querySelector('[class*="league"],[class*="League"]');
      return el?.textContent?.trim() || 'Standard';
    },

    _stats(row) {
      if (!row) return {};
      const lines = (row.innerText || '').split('\n')
        .map(s => s.trim()).filter(s => s.length > 1 && s.length < 200);
      return { rawText: lines.join(' | ').slice(0, 600) };
    },

    _image(row) {
      if (!row) return '';
      const img = row.querySelector('img');
      return img?.src || '';
    },

    _category(row) {
      const txt = (row?.innerText || '').toLowerCase();
      if (/sword|axe|mace|bow|staff|wand|dagger|claw|spear|flail|quarterstaff/.test(txt)) return 'weapon';
      if (/helmet|chest|gloves|boots|shield|body armour/.test(txt)) return 'armor';
      if (/ring|amulet|belt/.test(txt)) return 'accessory';
      if (/jewel|cluster/.test(txt)) return 'jewel';
      if (/gem|skill/.test(txt)) return 'gem';
      if (/orb|shard|fragment|scarab|divine|chaos|exalted|mirror|gold/.test(txt)) return 'currency';
      if (/flask/.test(txt)) return 'flask';
      if (/map|waystone/.test(txt)) return 'map';
      return 'other';
    },

    _empty() {
      return {
        id: this._uid(), timestamp: new Date().toISOString(),
        itemName: 'Unknown Item', category: 'other',
        price: { amount: 0, currency: 'unknown' },
        seller: 'Unknown', league: 'Unknown',
        searchUrl: window.location.href, stats: {}, imageUrl: '', notes: '',
      };
    },
  };

  // ============================================================
  //  CHEST SVG  (inline, used for both toggle and header)
  // ============================================================

  const CHEST_SVG = (w = 28, h = 28) => `
<svg width="${w}" height="${h}" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Body -->
  <rect x="3" y="14" width="26" height="14" rx="2.5" fill="#2e1e08" stroke="#c8a455" stroke-width="1.4"/>
  <!-- Lid -->
  <rect x="3" y="7" width="26" height="9" rx="2.5" fill="#1e1004" stroke="#c8a455" stroke-width="1.4"/>
  <!-- Lid highlight -->
  <rect x="5" y="9" width="22" height="2" rx="1" fill="#c8a455" opacity="0.15"/>
  <!-- Metal band -->
  <rect x="3" y="14" width="26" height="2.5" fill="#c8a455" opacity="0.20"/>
  <!-- Clasp plate -->
  <rect x="13" y="12.5" width="6" height="6" rx="1.2" fill="#c8a455" opacity="0.75"/>
  <!-- Clasp keyhole -->
  <circle cx="16" cy="15" r="1.2" fill="#1e1004"/>
  <rect x="15.4" y="15" width="1.2" height="2" rx="0.4" fill="#1e1004"/>
  <!-- Corner studs -->
  <circle cx="6"  cy="20" r="1" fill="#c8a455" opacity="0.6"/>
  <circle cx="26" cy="20" r="1" fill="#c8a455" opacity="0.6"/>
  <circle cx="6"  cy="24" r="1" fill="#c8a455" opacity="0.6"/>
  <circle cx="26" cy="24" r="1" fill="#c8a455" opacity="0.6"/>
  <!-- Glow hint -->
  <rect x="4" y="8" width="24" height="1" rx="0.5" fill="#f5dea0" opacity="0.08"/>
</svg>`;

  // ============================================================
  //  UI CLASS
  // ============================================================

  class PurchaseHistoryUI {
    constructor() {
      this.settings  = { language: 'en', panelPosition: 'right' };
      this.purchases = [];
      this.isOpen    = false;
      this.activeTab = 'history';
      this.host      = null;   // Shadow host element
      this.shadow    = null;   // ShadowRoot
      this.root      = null;   // .poe2ph-container inside shadow
      this.observer  = null;   // MutationObserver
    }

    // ----------------------------------------------------------
    //  Bootstrap
    // ----------------------------------------------------------

    async init() {
      this.settings  = await Storage.getSettings();
      this.purchases = await Storage.getPurchases();
      _lang          = this.settings.language || 'en';

      this._buildDOM();
      this._attachListeners();
      this._renderHistory();
      this._setupMutationObserver();
    }

    // ----------------------------------------------------------
    //  DOM Construction (Shadow DOM for full CSS isolation)
    // ----------------------------------------------------------

    _buildDOM() {
      // Shadow host — zero-width fixed anchor at the screen edge.
      // The toggle and panel are absolutely positioned inside, extending outward.
      this.host = document.createElement('div');
      this.host.id = 'poe2ph-root';
      const pos = this.settings.panelPosition;
      Object.assign(this.host.style, {
        position: 'fixed',
        top: '0',
        height: '100vh',
        width: '0',
        overflow: 'visible',
        zIndex: '2147483647',
        pointerEvents: 'none',
        [pos === 'left' ? 'left' : 'right']: '0',
      });
      document.body.appendChild(this.host);

      this.shadow = this.host.attachShadow({ mode: 'open' });

      // Link our stylesheet into the shadow root
      const cssLink = document.createElement('link');
      cssLink.rel  = 'stylesheet';
      cssLink.href = chrome.runtime.getURL('content/content.css');
      this.shadow.appendChild(cssLink);

      // Main container div
      this.root = document.createElement('div');
      this.root.className = `poe2ph-container poe2ph-${this.settings.panelPosition}`;
      this.root.innerHTML = this._containerHTML();
      this.shadow.appendChild(this.root);
    }

    // ----------------------------------------------------------
    //  HTML Templates
    // ----------------------------------------------------------

    _containerHTML() {
      const pos = this.settings.panelPosition;
      const arrowClosed = pos === 'left' ? '▶' : '◀';

      return `
        <!-- ── TOGGLE BUTTON ── -->
        <button class="poe2ph-toggle" id="poe2ph-toggle" title="${t('appName')}">
          ${CHEST_SVG(26, 26)}
          <span class="poe2ph-toggle-arrow" id="poe2ph-arrow">${arrowClosed}</span>
        </button>

        <!-- ── SLIDE PANEL ── -->
        <div class="poe2ph-panel" id="poe2ph-panel">

          <!-- Header -->
          <div class="poe2ph-header">
            <div class="poe2ph-header-inner">
              <div class="poe2ph-header-chest">${CHEST_SVG(38, 38)}</div>
              <div class="poe2ph-header-text">
                <h1 class="poe2ph-title">${t('appName')}</h1>
                <p class="poe2ph-subtitle">${t('appSubtitle')}</p>
              </div>
            </div>
            <div class="poe2ph-header-sep"></div>
          </div>

          <!-- Tabs -->
          <nav class="poe2ph-tabs">
            <button class="poe2ph-tab poe2ph-tab-active" data-tab="history">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              ${t('tabs.history')}
            </button>
            <button class="poe2ph-tab" data-tab="settings">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              ${t('tabs.settings')}
            </button>
          </nav>

          <!-- Tab: History -->
          <div class="poe2ph-tab-content poe2ph-tab-active" id="tab-history">
            <div class="poe2ph-history-list" id="poe2ph-history-list"></div>
          </div>

          <!-- Tab: Settings -->
          <div class="poe2ph-tab-content" id="tab-settings">
            ${this._settingsHTML()}
          </div>

          <!-- Toast notification -->
          <div class="poe2ph-toast" id="poe2ph-toast"></div>
        </div>
      `;
    }

    _settingsHTML() {
      const langs = [
        { code:'en', flag:'🇬🇧', name:'English'   },
        { code:'es', flag:'🇪🇸', name:'Español'   },
        { code:'pt', flag:'🇧🇷', name:'Português' },
        { code:'de', flag:'🇩🇪', name:'Deutsch'   },
        { code:'fr', flag:'🇫🇷', name:'Français'  },
        { code:'ru', flag:'🇷🇺', name:'Русский'   },
        { code:'ja', flag:'🇯🇵', name:'日本語'     },
        { code:'ko', flag:'🇰🇷', name:'한국어'     },
      ];
      const pos = this.settings.panelPosition;

      return `
        <div class="poe2ph-settings-content">

          <!-- Language -->
          <div class="poe2ph-setting-card">
            <h3 class="poe2ph-setting-title">${t('settings.language')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.languageDesc')}</p>
            <div class="poe2ph-lang-grid">
              ${langs.map(l => `
                <button class="poe2ph-lang-btn${this.settings.language === l.code ? ' poe2ph-active' : ''}"
                        data-lang="${l.code}" title="${l.name}">
                  <span class="poe2ph-lang-flag">${l.flag}</span>
                  <span class="poe2ph-lang-name">${l.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Panel Position -->
          <div class="poe2ph-setting-card">
            <h3 class="poe2ph-setting-title">${t('settings.panelPosition')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.panelPositionDesc')}</p>
            <div class="poe2ph-position-btns">
              <button class="poe2ph-pos-btn${pos==='left' ?' poe2ph-active':''}" data-position="left">${t('settings.left')}</button>
              <button class="poe2ph-pos-btn${pos==='right'?' poe2ph-active':''}" data-position="right">${t('settings.right')}</button>
              <button class="poe2ph-pos-btn poe2ph-pos-reset" id="poe2ph-reset-pos">${t('settings.reset')}</button>
            </div>
          </div>

          <!-- Export -->
          <div class="poe2ph-setting-card">
            <h3 class="poe2ph-setting-title">${t('settings.export')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.exportDesc')}</p>
            <button class="poe2ph-btn poe2ph-btn-primary" id="poe2ph-export-btn">${t('settings.exportBtn')}</button>
          </div>

          <!-- Clear -->
          <div class="poe2ph-setting-card poe2ph-danger-card">
            <h3 class="poe2ph-setting-title poe2ph-danger-title">${t('settings.clearHistory')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.clearHistoryDesc')}</p>
            <button class="poe2ph-btn poe2ph-btn-danger" id="poe2ph-clear-btn">${t('settings.clearBtn')}</button>
          </div>

        </div>
      `;
    }

    // ----------------------------------------------------------
    //  Event Listeners
    // ----------------------------------------------------------

    _attachListeners() {
      const $ = id => this.shadow.getElementById(id);

      $('poe2ph-toggle').addEventListener('click', () => this._toggle());

      this.shadow.querySelectorAll('.poe2ph-tab').forEach(btn =>
        btn.addEventListener('click', () => this._switchTab(btn.dataset.tab)));

      this._attachSettingsListeners();
    }

    _attachSettingsListeners() {
      const $ = id => this.shadow.getElementById(id);

      // Language
      this.shadow.querySelectorAll('.poe2ph-lang-btn').forEach(btn =>
        btn.addEventListener('click', () => this._setLanguage(btn.dataset.lang)));

      // Panel position
      this.shadow.querySelectorAll('.poe2ph-pos-btn[data-position]').forEach(btn =>
        btn.addEventListener('click', () => this._setPosition(btn.dataset.position)));
      $('poe2ph-reset-pos')?.addEventListener('click', () => this._setPosition('right'));

      // Export / Clear
      $('poe2ph-export-btn')?.addEventListener('click', () => this._exportHistory());
      $('poe2ph-clear-btn')?.addEventListener('click', () => this._clearHistory());
    }

    // ----------------------------------------------------------
    //  Toggle & Tab
    // ----------------------------------------------------------

    _toggle() {
      this.isOpen = !this.isOpen;
      const panel  = this.shadow.getElementById('poe2ph-panel');
      const arrow  = this.shadow.getElementById('poe2ph-arrow');
      const toggle = this.shadow.getElementById('poe2ph-toggle');
      const pos    = this.settings.panelPosition;

      panel.classList.toggle('poe2ph-panel-open', this.isOpen);
      toggle.classList.toggle('poe2ph-toggle-open', this.isOpen);

      // Compress page content by pushing body margin (mirrors the panel width)
      const marginSide = pos === 'left' ? 'marginLeft' : 'marginRight';
      document.body.style.transition = 'margin 0.32s cubic-bezier(0.4, 0, 0.2, 1)';
      document.body.style[marginSide] = this.isOpen ? '380px' : '';

      if (this.isOpen) {
        // arrow points "inward" when open
        arrow.textContent = pos === 'left' ? '◀' : '▶';
      } else {
        arrow.textContent = pos === 'left' ? '▶' : '◀';
      }
    }

    _switchTab(name) {
      this.activeTab = name;
      this.shadow.querySelectorAll('.poe2ph-tab').forEach(t =>
        t.classList.toggle('poe2ph-tab-active', t.dataset.tab === name));
      this.shadow.querySelectorAll('.poe2ph-tab-content').forEach(c =>
        c.classList.remove('poe2ph-tab-active'));
      this.shadow.getElementById(`tab-${name}`)?.classList.add('poe2ph-tab-active');
    }

    // ----------------------------------------------------------
    //  History Rendering
    // ----------------------------------------------------------

    _renderHistory() {
      const list = this.shadow.getElementById('poe2ph-history-list');
      if (!list) return;

      if (!this.purchases.length) {
        list.innerHTML = `
          <div class="poe2ph-empty">
            ${CHEST_SVG(52, 52)}
            <p class="poe2ph-empty-text">${t('history.empty')}</p>
            <p class="poe2ph-empty-hint">${t('history.emptyHint')}</p>
          </div>`;
        return;
      }

      list.innerHTML = this.purchases.map(p => this._cardHTML(p)).join('');

      // Attach card listeners
      list.querySelectorAll('.poe2ph-card').forEach(card => {
        card.addEventListener('click', () => card.classList.toggle('poe2ph-card-expanded'));
      });
      list.querySelectorAll('.poe2ph-delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this._deletePurchase(btn.dataset.id);
        });
      });
      list.querySelectorAll('.poe2ph-note-input').forEach(inp => {
        inp.addEventListener('click', e => e.stopPropagation());
        inp.addEventListener('blur', () => Storage.updateNote(inp.dataset.id, inp.value));
      });
      list.querySelectorAll('.poe2ph-open-search').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          window.open(btn.dataset.url, '_blank');
        });
      });
    }

    _cardHTML(p) {
      const date  = new Date(p.timestamp);
      const ds    = date.toLocaleDateString();
      const ts    = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const icon  = CATEGORY_ICONS[p.category] || '📦';
      const cname = t(`categories.${p.category}`) || p.category;
      const curr  = CURRENCY_DISPLAY[p.price?.currency] || p.price?.currency || '?';

      return `
        <div class="poe2ph-card" data-id="${p.id}">
          <div class="poe2ph-card-main">
            <div class="poe2ph-card-icon">${icon}</div>
            <div class="poe2ph-card-info">
              <div class="poe2ph-card-name" title="${this._esc(p.itemName)}">${this._esc(p.itemName)}</div>
              <div class="poe2ph-card-meta">
                <span class="poe2ph-price-badge">${p.price?.amount} ${curr}</span>
                <span class="poe2ph-date">${ds} ${ts}</span>
              </div>
            </div>
            <button class="poe2ph-delete-btn" data-id="${p.id}" title="${t('history.delete')}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="poe2ph-card-details">
            <div class="poe2ph-detail-row">
              <span class="poe2ph-detail-label">${t('history.seller')}</span>
              <span class="poe2ph-detail-value">${this._esc(p.seller)}</span>
            </div>
            <div class="poe2ph-detail-row">
              <span class="poe2ph-detail-label">${t('history.league')}</span>
              <span class="poe2ph-detail-value">${this._esc(p.league)}</span>
            </div>
            <div class="poe2ph-detail-row">
              <span class="poe2ph-detail-label">${t('history.category')}</span>
              <span class="poe2ph-detail-value">${icon} ${cname}</span>
            </div>
            ${p.stats?.rawText ? `
            <div class="poe2ph-detail-row">
              <span class="poe2ph-detail-label">Stats</span>
              <span class="poe2ph-detail-value poe2ph-stats-text">${this._esc(p.stats.rawText.slice(0,250))}</span>
            </div>` : ''}
            ${p.searchUrl ? `
            <div class="poe2ph-detail-row">
              <span class="poe2ph-detail-label">${t('history.searchUrl')}</span>
              <button class="poe2ph-open-search poe2ph-link-btn" data-url="${this._esc(p.searchUrl)}">
                🔗 ${t('history.openSearch')}
              </button>
            </div>` : ''}
            <textarea class="poe2ph-note-input"
                      data-id="${p.id}"
                      placeholder="${t('history.notes')}"
                      rows="2">${this._esc(p.notes || '')}</textarea>
          </div>
        </div>`;
    }

    // ----------------------------------------------------------
    //  Actions
    // ----------------------------------------------------------

    async _deletePurchase(id) {
      await Storage.deletePurchase(id);
      this.purchases = this.purchases.filter(p => p.id !== id);
      this._renderHistory();
      this._toast(t('toast.deleted'));
    }

    async _setLanguage(lang) {
      this.settings.language = lang;
      _lang = lang;
      await Storage.saveSettings(this.settings);
      // Rebuild the panel in-place
      const wasOpen = this.isOpen;
      this.root.innerHTML = this._containerHTML();
      this._attachListeners();
      this._renderHistory();
      if (wasOpen) {
        this.shadow.getElementById('poe2ph-panel')?.classList.add('poe2ph-panel-open');
        this._switchTab(this.activeTab);
      }
    }

    async _setPosition(pos) {
      // Clear margin from whichever side the panel was on
      document.body.style.marginLeft  = '';
      document.body.style.marginRight = '';

      this.settings.panelPosition = pos;
      await Storage.saveSettings(this.settings);

      // Update host alignment
      this.host.style.left  = pos === 'left'  ? '0' : '';
      this.host.style.right = pos === 'right' ? '0' : '';

      // Update container class
      this.root.className = `poe2ph-container poe2ph-${pos}`;

      // Rebuild panel HTML (arrows + active state update)
      const wasOpen = this.isOpen;
      this.isOpen = false; // reset so _toggle can re-apply margin on the correct side
      this.root.innerHTML = this._containerHTML();
      this._attachListeners();
      this._renderHistory();
      if (wasOpen) {
        this._toggle();            // re-opens on the new side with correct margin
        this._switchTab(this.activeTab);
      }
    }

    async _exportHistory() {
      const data = {
        exported:  new Date().toISOString(),
        version:   '0.1.0',
        count:     this.purchases.length,
        purchases: this.purchases,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `poe2-purchases-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this._toast(t('toast.exported'));
    }

    async _clearHistory() {
      if (!confirm(t('settings.clearConfirm'))) return;
      await Storage.clearPurchases();
      this.purchases = [];
      this._renderHistory();
      this._toast(t('toast.cleared'));
    }

    // ----------------------------------------------------------
    //  Record Purchase (called from MutationObserver)
    // ----------------------------------------------------------

    async recordPurchase(btn) {
      const item = Extractor.extract(btn);
      await Storage.addPurchase(item);
      this.purchases.unshift(item);
      this._renderHistory();
      this._toast(t('toast.purchased'));

      // Auto-open panel and switch to history
      if (!this.isOpen) this._toggle();
      this._switchTab('history');
    }

    // ----------------------------------------------------------
    //  MutationObserver — detect "Travel to Hideout" buttons
    // ----------------------------------------------------------

    _setupMutationObserver() {
      const watchNode = node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // Check the node itself
        const ownText = node.textContent?.trim() || '';
        if (TRAVEL_TEXTS.has(ownText) && !node.__poe2ph) {
          this._trackButton(node);
        }

        // Check all descendants
        try {
          node.querySelectorAll('*').forEach(el => {
            const txt = el.textContent?.trim() || '';
            if (TRAVEL_TEXTS.has(txt) && !el.__poe2ph) {
              this._trackButton(el);
            }
          });
        } catch (e) { /* silent */ }
      };

      // Check what's already on the page
      watchNode(document.body);

      this.observer = new MutationObserver(mutations => {
        for (const m of mutations) {
          for (const node of m.addedNodes) watchNode(node);
        }
      });
      this.observer.observe(document.body, { childList: true, subtree: true });
    }

    _trackButton(el) {
      el.__poe2ph = true;
      el.addEventListener('click', () => this.recordPurchase(el), { once: false });
    }

    // ----------------------------------------------------------
    //  Toast notification
    // ----------------------------------------------------------

    _toast(msg, ms = 3000) {
      const el = this.shadow.getElementById('poe2ph-toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.add('poe2ph-toast-visible');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(() => el.classList.remove('poe2ph-toast-visible'), ms);
    }

    // ----------------------------------------------------------
    //  Helpers
    // ----------------------------------------------------------

    _esc(str) {
      return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  }

  // ============================================================
  //  BOOT
  // ============================================================

  function boot() {
    const ui = new PurchaseHistoryUI();
    ui.init().catch(console.error);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
