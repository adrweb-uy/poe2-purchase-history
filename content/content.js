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

  const CURRENT_VERSION = '0.1.0';

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

  const CLASS_INFO = {
    witch:     { name: 'Witch', emoji: '🧙‍♀️' },
    ranger:    { name: 'Ranger', emoji: '🏹' },
    mercenary: { name: 'Mercenary', emoji: '🎯' },
    warrior:   { name: 'Warrior', emoji: '🛡️' },
    monk:      { name: 'Monk', emoji: '🧘' },
    sorceress: { name: 'Sorceress', emoji: '⚡' },
    druid:     { name: 'Druid', emoji: '🐻' },
    huntress:  { name: 'Huntress', emoji: '🐆' },
    shadow:    { name: 'Shadow', emoji: '👤' },
    templar:   { name: 'Templar', emoji: '⛪' },
    marauder:  { name: 'Marauder', emoji: '💪' },
    duelist:   { name: 'Duelist', emoji: '🤺' },
  };

  // ============================================================
  //  TRANSLATIONS  (EN + ES inline for MVP)
  // ============================================================

  const TRANSLATIONS = {
    en: {
      appName:    'POE2 Purchase History',
      appSubtitle: 'Trade Companion',
      banner: {
        title:      'NEW VERSION',
        text:       'POE2 Purchase History has been updated to version 0.1.0.',
      },
      tabs: { history: 'History', settings: 'Settings' },
      charBar: {
        label: 'Character:',
        all: 'All Characters',
        none: 'No Character',
        newBtn: 'New',
        placeholder: 'Character name...',
        createBtn: 'Create',
        cancelBtn: 'Cancel',
        selectClass: 'Select Class',
        charLabel: 'Character',
        moveTo: 'Move to:',
        titleNew: 'Create New Character',
      },
      classes: {
        witch: 'Witch', ranger: 'Ranger', mercenary: 'Mercenary',
        warrior: 'Warrior', monk: 'Monk', sorceress: 'Sorceress',
        druid: 'Druid', huntress: 'Huntress', shadow: 'Shadow',
        templar: 'Templar', marauder: 'Marauder', duelist: 'Duelist',
      },
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
      banner: {
        title:      'NUEVA VERSIÓN',
        text:       'POE2 Historial de Compras se actualizó a la versión 0.1.0.',
      },
      tabs: { history: 'Historial', settings: 'Ajustes' },
      charBar: {
        label: 'Personaje:',
        all: 'Todos los Personajes',
        none: 'Sin Personaje',
        newBtn: 'Nuevo',
        placeholder: 'Nombre del personaje...',
        createBtn: 'Crear',
        cancelBtn: 'Cancelar',
        selectClass: 'Elegí Clase',
        charLabel: 'Personaje',
        moveTo: 'Mover a:',
        titleNew: 'Crear Nuevo Personaje',
      },
      classes: {
        witch: 'Bruja', ranger: 'Cazadora', mercenary: 'Mercenario',
        warrior: 'Guerrero', monk: 'Monje', sorceress: 'Hechicera',
        druid: 'Druida', huntress: 'Cazadora de Lanzas', shadow: 'Sombra',
        templar: 'Templario', marauder: 'Karui', duelist: 'Duelista',
      },
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
      return new Promise(resolve => {
        try {
          chrome.storage.local.get(key, r => {
            if (chrome.runtime.lastError) {
              console.warn('[POE2PH] Storage get error:', chrome.runtime.lastError);
              resolve(def);
              return;
            }
            resolve(r && r[key] !== undefined ? r[key] : def);
          });
        } catch (e) {
          console.warn('[POE2PH] Storage get exception:', e);
          resolve(def);
        }
      });
    },
    async _set(key, val) {
      return new Promise(resolve => {
        try {
          chrome.storage.local.set({ [key]: val }, () => {
            if (chrome.runtime.lastError) {
              console.warn('[POE2PH] Storage set error:', chrome.runtime.lastError);
            }
            resolve();
          });
        } catch (e) {
          console.warn('[POE2PH] Storage set exception:', e);
          resolve();
        }
      });
    },
    async getPurchases()         { return this._get('poe2ph_purchases', []); },
    async setPurchases(list)     { return this._set('poe2ph_purchases', list); },
    async getSettings()          { return this._get('poe2ph_settings', { language: 'en', panelPosition: 'right', sidebarOpen: false, activeCharacterId: 'all' }); },
    async saveSettings(s)        { return this._set('poe2ph_settings', s); },
    async getCharacters()        { return this._get('poe2ph_characters', []); },
    async setCharacters(list)    { return this._set('poe2ph_characters', list); },

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
          rarity:    this._rarity(row),
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

      // 1. Try to find the item header container
      const header = row.querySelector('.itemHeader') || row.querySelector('.item-header') || row.querySelector('[class*="Header"]');
      if (header) {
        const nameEl = header.querySelector('.itemName') || header.querySelector('.item-name') || header.querySelector('[class*="Name"]');
        const typeEl = header.querySelector('.typeLine') || header.querySelector('.type-line') || header.querySelector('[class*="Type"]');

        const nameText = nameEl?.textContent?.trim() || '';
        const typeText = typeEl?.textContent?.trim() || '';

        // Exclude status words if mistakenly captured
        if (nameText && nameText.toLowerCase() !== 'verified' && nameText.toLowerCase() !== 'online') {
          if (typeText) return `${nameText} ${typeText}`;
          return nameText;
        }

        // Fallback: parse lines of header text
        const lines = header.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        const filteredLines = lines.filter(l => {
          const lLower = l.toLowerCase();
          return lLower !== 'verified' && lLower !== 'online' && lLower !== 'offline';
        });
        if (filteredLines.length > 0) {
          return filteredLines.join(' ');
        }
      }

      // 2. Direct elements fallback
      const itemNameEl = row.querySelector('.itemName') || row.querySelector('.item-name') || row.querySelector('[class*="itemName"]');
      const typeLineEl = row.querySelector('.typeLine') || row.querySelector('.type-line') || row.querySelector('[class*="typeLine"]');
      const itemName = itemNameEl?.textContent?.trim() || '';
      const typeLine = typeLineEl?.textContent?.trim() || '';

      if (itemName && itemName.toLowerCase() !== 'verified' && typeLine) {
        return `${itemName} ${typeLine}`;
      } else if (itemName && itemName.toLowerCase() !== 'verified') {
        return itemName;
      } else if (typeLine) {
        return typeLine;
      }

      // 3. Fallback to row text lines (ignoring status words, account names, and prices)
      const lines = (row.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
      const filtered = lines.filter(l => {
        const lLower = l.toLowerCase();
        return lLower !== 'verified' && lLower !== 'online' && lLower !== 'offline' && !lLower.startsWith('acc:') && !l.includes('Exalted') && !l.includes('Chaos') && !l.includes('Divine');
      });
      return filtered[0] || 'Unknown Item';
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
      // Target specific class container first to avoid profile/currency images
      const img = row.querySelector('.iconContainer img') || row.querySelector('img');
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

    _rarity(row) {
      if (!row) return 'normal';

      // Check classes on itemHeader, itemName, typeLine or any descendant of the row
      const elements = row.querySelectorAll('.itemHeader, .itemName, .typeLine, .itemElement, [class*="unique"], [class*="rare"], [class*="magic"], [class*="gem"], [class*="currency"]');
      for (const el of elements) {
        for (const cls of el.classList) {
          const c = cls.toLowerCase();
          if (c === 'unique') return 'unique';
          if (c === 'rare') return 'rare';
          if (c === 'magic') return 'magic';
          if (c === 'normal') return 'normal';
          if (c === 'gem') return 'gem';
          if (c === 'currency') return 'currency';
        }
      }

      // Fallback: check text content
      const txt = (row.innerText || '');
      if (txt.includes('Rarity: Unique') || row.querySelector('.unique') || row.querySelector('[class*="unique"]') || row.querySelector('[class*="-unique"]')) return 'unique';
      if (txt.includes('Rarity: Rare') || row.querySelector('.rare') || row.querySelector('[class*="rare"]') || row.querySelector('[class*="-rare"]')) return 'rare';
      if (txt.includes('Rarity: Magic') || row.querySelector('.magic') || row.querySelector('[class*="magic"]') || row.querySelector('[class*="-magic"]')) return 'magic';
      if (txt.includes('Rarity: Gem') || row.querySelector('.gem') || row.querySelector('[class*="gem"]') || row.querySelector('[class*="-gem"]')) return 'gem';
      if (txt.includes('Rarity: Currency') || row.querySelector('.currency') || row.querySelector('[class*="currency"]') || row.querySelector('[class*="-currency"]')) return 'currency';

      return 'normal';
    },

    _empty() {
      return {
        id: this._uid(), timestamp: new Date().toISOString(),
        itemName: 'Unknown Item', category: 'other',
        price: { amount: 0, currency: 'unknown' },
        seller: 'Unknown', league: 'Unknown',
        searchUrl: window.location.href, stats: {}, imageUrl: '', notes: '',
        rarity: 'normal',
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
      this.settings  = { language: 'en', panelPosition: 'right', sidebarOpen: false, activeCharacterId: 'all' };
      this.purchases = [];
      this.characters = [];
      this.isOpen    = false;
      this.activeTab = 'history';
      this.selectedClass = null;
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
      this.characters = await Storage.getCharacters();
      _lang          = this.settings.language || 'en';
      this.selectedClass = null;

      this._buildDOM();
      this._attachListeners();
      this._renderHistory();
      this._setupMutationObserver();

      // Restore open state without animation on page load
      if (this.settings.sidebarOpen) {
        this._toggle(false);
      }
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

      // Inject a <style> tag into the host page for reliable smooth transitions.
      // CSS class toggling on document.body is far more reliable than inline
      // style manipulation — the browser can properly plan and execute the animation.
      if (!document.getElementById('poe2ph-body-style')) {
        const s = document.createElement('style');
        s.id = 'poe2ph-body-style';
        // Only the margin classes here — transition is set via inline style below
        // (inline !important beats any author stylesheet, including the site's own)
        s.textContent = [
          'body.poe2ph-open-right { margin-right: 380px !important; }',
          'body.poe2ph-open-left  { margin-left:  380px !important; }',
        ].join('\n');
        document.head.appendChild(s);
      }
      // Inline !important is the highest possible CSS priority — no site stylesheet
      // or inline style can override it, guaranteeing the transition always fires.
      document.body.style.setProperty(
        'transition',
        'margin-right 0.4s ease, margin-left 0.4s ease',
        'important'
      );

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
      const showBanner = this.settings.dismissedVersion !== CURRENT_VERSION;

      return `
        <!-- ── TOGGLE BUTTON ── -->
        <button class="poe2ph-toggle" id="poe2ph-toggle" title="${t('appName')}">
          <img src="${chrome.runtime.getURL('icons/chest_48.png')}" width="30" height="30" alt="">
          <span class="poe2ph-toggle-arrow" id="poe2ph-arrow">${arrowClosed}</span>
        </button>

        <!-- ── SLIDE PANEL ── -->
        <div class="poe2ph-panel" id="poe2ph-panel">

          <!-- Header -->
          <div class="poe2ph-header">
            <div class="poe2ph-header-inner">
              <img class="poe2ph-header-chest"
                   src="${chrome.runtime.getURL('icons/chest_48.png')}"
                   width="44" height="44" alt="">
              <div class="poe2ph-header-text">
                <h1 class="poe2ph-title">${t('appName')}</h1>
                <p class="poe2ph-subtitle">${t('appSubtitle')}</p>
              </div>
              <button class="poe2ph-header-collapse" id="poe2ph-header-collapse"
                      title="Collapse panel">${pos === 'right' ? '▶' : '◀'}</button>
            </div>
            <div class="poe2ph-header-sep"></div>
          </div>

          <!-- Banner Area -->
          <div class="poe2ph-banner${showBanner ? '' : ' poe2ph-hidden'}" id="poe2ph-banner">
            <div class="poe2ph-banner-content">
              <div class="poe2ph-banner-label">${t('banner.title')}</div>
              <div class="poe2ph-banner-text">${t('banner.text')}</div>
            </div>
            <button class="poe2ph-banner-close" id="poe2ph-banner-close" title="Dismiss announcement">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
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
            <!-- Character selector bar -->
            <div class="poe2ph-char-bar">
              <div class="poe2ph-char-selector">
                <span class="poe2ph-char-label">${t('charBar.label')}</span>
                <select class="poe2ph-char-select" id="poe2ph-char-select">
                  <option value="all" ${this.settings.activeCharacterId === 'all' ? 'selected' : ''}>${t('charBar.all')}</option>
                  ${this.characters.map(c => `
                    <option value="${c.id}" ${this.settings.activeCharacterId === c.id ? 'selected' : ''}>
                      ${CLASS_INFO[c.class]?.emoji || '👤'} ${c.name}
                    </option>
                  `).join('')}
                  <option value="none" ${this.settings.activeCharacterId === 'none' ? 'selected' : ''}>${t('charBar.none')}</option>
                </select>
              </div>
              <button class="poe2ph-char-add-btn" id="poe2ph-char-add-btn" title="${t('charBar.newBtn')}">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                ${t('charBar.newBtn')}
              </button>
            </div>

            <!-- Inline character creation form (hidden by default) -->
            <div class="poe2ph-char-form poe2ph-hidden" id="poe2ph-char-form">
              <div class="poe2ph-char-form-title">${t('charBar.titleNew')}</div>
              <input type="text" class="poe2ph-char-name-input" id="poe2ph-char-name-input" placeholder="${t('charBar.placeholder')}">
              
              <div class="poe2ph-class-grid">
                ${Object.entries(CLASS_INFO).map(([key, value]) => `
                  <button class="poe2ph-class-option" data-class="${key}" title="${t(`classes.${key}`)}">
                    <span class="poe2ph-class-emoji">${value.emoji}</span>
                    <span class="poe2ph-class-name">${t(`classes.${key}`)}</span>
                  </button>
                `).join('')}
              </div>

              <div class="poe2ph-char-form-actions">
                <button class="poe2ph-btn poe2ph-btn-primary" id="poe2ph-char-save-btn">${t('charBar.createBtn')}</button>
                <button class="poe2ph-btn" id="poe2ph-char-cancel-btn">${t('charBar.cancelBtn')}</button>
              </div>
            </div>

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
      $('poe2ph-header-collapse').addEventListener('click', () => this._toggle());
      $('poe2ph-banner-close')?.addEventListener('click', () => this._dismissBanner());

      this.shadow.querySelectorAll('.poe2ph-tab').forEach(btn =>
        btn.addEventListener('click', () => this._switchTab(btn.dataset.tab)));

      this._attachSettingsListeners();
      this._attachCharacterListeners();
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

    _toggle(animate = true) {
      this.isOpen = !this.isOpen;

      // Persist the open state
      this.settings.sidebarOpen = this.isOpen;
      Storage.saveSettings(this.settings).catch(console.error);

      const panel  = this.shadow.getElementById('poe2ph-panel');
      const arrow  = this.shadow.getElementById('poe2ph-arrow');
      const toggle = this.shadow.getElementById('poe2ph-toggle');
      const pos    = this.settings.panelPosition;

      if (!animate) {
        // Temporarily disable transition on body and panel
        const originalPanelTransition = panel.style.transition;
        panel.style.transition = 'none';

        const originalBodyTransition = document.body.style.getPropertyValue('transition');
        const originalBodyTransitionPriority = document.body.style.getPropertyPriority('transition');
        document.body.style.setProperty('transition', 'none', 'important');

        // Force reflow
        panel.offsetHeight;

        panel.classList.toggle('poe2ph-panel-open', this.isOpen);
        toggle.classList.toggle('poe2ph-toggle-open', this.isOpen);
        this.root.classList.toggle('poe2ph-is-open', this.isOpen);

        const bodyClass = pos === 'left' ? 'poe2ph-open-left' : 'poe2ph-open-right';
        document.body.classList.toggle(bodyClass, this.isOpen);

        // Force reflow
        panel.offsetHeight;

        // Restore transitions
        requestAnimationFrame(() => {
          panel.style.transition = originalPanelTransition;
          if (originalBodyTransition) {
            document.body.style.setProperty('transition', originalBodyTransition, originalBodyTransitionPriority);
          } else {
            document.body.style.removeProperty('transition');
          }
        });
      } else {
        panel.classList.toggle('poe2ph-panel-open', this.isOpen);
        toggle.classList.toggle('poe2ph-toggle-open', this.isOpen);
        this.root.classList.toggle('poe2ph-is-open', this.isOpen);

        const bodyClass = pos === 'left' ? 'poe2ph-open-left' : 'poe2ph-open-right';
        document.body.classList.toggle(bodyClass, this.isOpen);
      }

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

      const activeChar = this.settings.activeCharacterId || 'all';

      // Filter purchases
      const filtered = this.purchases.filter(p => {
        if (activeChar === 'all') return true;
        if (activeChar === 'none') return !p.characterId || p.characterId === 'none';
        return p.characterId === activeChar;
      });

      if (!filtered.length) {
        list.innerHTML = `
          <div class="poe2ph-empty">
            ${CHEST_SVG(52, 52)}
            <p class="poe2ph-empty-text">${t('history.empty')}</p>
            <p class="poe2ph-empty-hint">${t('history.emptyHint')}</p>
          </div>`;
        return;
      }

      list.innerHTML = filtered.map(p => this._cardHTML(p)).join('');

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

      // Character re-assignment in expanded cards
      list.querySelectorAll('.poe2ph-card-char-select').forEach(sel => {
        sel.addEventListener('click', e => e.stopPropagation());
        sel.addEventListener('change', async () => {
          const purchaseId = sel.dataset.id;
          const characterId = sel.value;

          // Update in memory
          const purchase = this.purchases.find(x => x.id === purchaseId);
          if (purchase) {
            purchase.characterId = characterId;

            // Save to storage
            const allPurchases = await Storage.getPurchases();
            const pStore = allPurchases.find(x => x.id === purchaseId);
            if (pStore) {
              pStore.characterId = characterId;
              await Storage.setPurchases(allPurchases);
            }
          }

          // Re-render history to reflect changes
          this._renderHistory();
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

      const char = this.characters.find(c => c.id === p.characterId);
      const charText = char ? `${CLASS_INFO[char.class]?.emoji || '👤'} ${char.name}` : '';

      // Render item image if it exists, otherwise fallback to standard category emoji icon
      let iconHTML = `<div class="poe2ph-card-icon">${icon}</div>`;
      if (p.imageUrl) {
        iconHTML = `<div class="poe2ph-card-img-container"><img class="poe2ph-card-img" src="${this._esc(p.imageUrl)}" alt=""></div>`;
      }

      const rarityClass = `poe2ph-rarity-${p.rarity || 'normal'}`;

      return `
        <div class="poe2ph-card" data-id="${p.id}">
          <div class="poe2ph-card-main">
            ${iconHTML}
            <div class="poe2ph-card-info">
              <div class="poe2ph-card-name ${rarityClass}" title="${this._esc(p.itemName)}">${this._esc(p.itemName)}</div>
              <div class="poe2ph-card-meta">
                <span class="poe2ph-price-badge">${p.price?.amount} ${curr}</span>
                <span class="poe2ph-date">${ds} ${ts}</span>
                ${charText ? `<span class="poe2ph-char-badge" title="${t('charBar.charLabel')}: ${this._esc(char.name)}">${charText}</span>` : ''}
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

            <!-- Re-assign Character Dropdown -->
            <div class="poe2ph-detail-row">
              <span class="poe2ph-detail-label">${t('charBar.moveTo')}</span>
              <select class="poe2ph-card-char-select" data-id="${p.id}">
                <option value="none" ${!p.characterId || p.characterId === 'none' ? 'selected' : ''}>${t('charBar.none')}</option>
                ${this.characters.map(c => `
                  <option value="${c.id}" ${p.characterId === c.id ? 'selected' : ''}>
                    ${CLASS_INFO[c.class]?.emoji || '👤'} ${c.name}
                  </option>
                `).join('')}
              </select>
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
      // Remove both side classes so the old margin animates back to 0
      document.body.classList.remove('poe2ph-open-right', 'poe2ph-open-left');

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

      // Assign currently active character ID (default to 'none' if showing 'all' or 'none')
      const activeChar = this.settings.activeCharacterId || 'all';
      item.characterId = (activeChar === 'all' || activeChar === 'none') ? 'none' : activeChar;

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
      el.addEventListener('click', (e) => {
        if (e.__poe2ph_handled) return;
        e.__poe2ph_handled = true;
        this.recordPurchase(el);
      }, { once: false });
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

    async _dismissBanner() {
      this.settings.dismissedVersion = CURRENT_VERSION;
      await Storage.saveSettings(this.settings);

      const banner = this.shadow.getElementById('poe2ph-banner');
      if (banner) {
        banner.style.transition = 'opacity 0.25s ease, max-height 0.25s ease, padding 0.25s ease, border 0.25s ease';
        banner.style.opacity = '0';
        banner.style.maxHeight = '0';
        banner.style.paddingTop = '0';
        banner.style.paddingBottom = '0';
        banner.style.borderBottomWidth = '0';
        setTimeout(() => {
          banner.classList.add('poe2ph-hidden');
        }, 250);
      }
    }

    _attachCharacterListeners() {
      const $ = id => this.shadow.getElementById(id);

      // Select active character change
      const select = $('poe2ph-char-select');
      if (select) {
        select.addEventListener('change', () => {
          this.settings.activeCharacterId = select.value;
          Storage.saveSettings(this.settings).catch(console.error);
          this._renderHistory();
        });
      }

      // Show creation form
      $('poe2ph-char-add-btn')?.addEventListener('click', () => {
        const form = $('poe2ph-char-form');
        form.classList.remove('poe2ph-hidden');
        $('poe2ph-char-name-input').focus();
      });

      // Cancel character creation
      $('poe2ph-char-cancel-btn')?.addEventListener('click', () => {
        this._resetCharForm();
      });

      // Class option buttons selection
      this.shadow.querySelectorAll('.poe2ph-class-option').forEach(btn => {
        btn.addEventListener('click', () => {
          this.shadow.querySelectorAll('.poe2ph-class-option').forEach(b => b.classList.remove('poe2ph-active'));
          btn.classList.add('poe2ph-active');
          this.selectedClass = btn.dataset.class;
        });
      });

      // Save character
      $('poe2ph-char-save-btn')?.addEventListener('click', () => this._saveNewCharacter());
    }

    _resetCharForm() {
      const $ = id => this.shadow.getElementById(id);
      const form = $('poe2ph-char-form');
      if (form) {
        form.classList.add('poe2ph-hidden');
        $('poe2ph-char-name-input').value = '';
        this.shadow.querySelectorAll('.poe2ph-class-option').forEach(b => b.classList.remove('poe2ph-active'));
        this.selectedClass = null;
      }
    }

    async _saveNewCharacter() {
      const $ = id => this.shadow.getElementById(id);
      const nameInp = $('poe2ph-char-name-input');
      const name = nameInp?.value?.trim() || '';

      if (!name) {
        alert(_lang === 'es' ? 'Por favor ingresá un nombre' : 'Please enter a name');
        return;
      }

      if (!this.selectedClass) {
        alert(_lang === 'es' ? 'Por favor elegí una clase' : 'Please select a class');
        return;
      }

      const newChar = {
        id: 'char_' + Date.now(),
        name: name,
        class: this.selectedClass,
        created: new Date().toISOString()
      };

      this.characters.push(newChar);
      await Storage.setCharacters(this.characters);

      // Automatically set as active character
      this.settings.activeCharacterId = newChar.id;
      await Storage.saveSettings(this.settings);

      // Reset form fields
      this._resetCharForm();

      // Rebuild UI container to update dropdown options
      const wasOpen = this.isOpen;
      this.root.innerHTML = this._containerHTML();
      this._attachListeners();
      this._renderHistory();
      if (wasOpen) {
        this.shadow.getElementById('poe2ph-panel')?.classList.add('poe2ph-panel-open');
        this._switchTab(this.activeTab);
      }
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
