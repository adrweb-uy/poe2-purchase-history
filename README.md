# POE2 Purchase History

A Chrome extension that injects a sleek side panel into the [Path of Exile 2 trade site](https://www.pathofexile.com/trade2), letting you track every item you buy without leaving the page.

---

## ✨ Features

### 📋 Purchase Tracking
- Automatically records a purchase when you click **"Travel to Hideout"** on any trade result.
- Captures item name, category, price, seller, league, and the original search URL.
- Detects item rarity (Normal, Magic, Rare, Unique, Gem, Currency) and colours the name accordingly.
- Displays item art directly from the trade site.

### 🗂️ Character Management
- Create named characters with a class (Witch, Ranger, Mercenary, Warrior, Monk, Sorceress, Druid, Huntress, Shadow, Templar, Marauder, Duelist).
- Assign purchases to a character and filter the history list by character.
- Re-assign purchases to a different character at any time from the expanded card view.

### 🗑️ Trash / Soft Delete
- Deleting a purchase moves it to a **Trash** tab — nothing is permanently lost by accident.
- Restore individual purchases or empty the whole trash at once.

### ⚙️ Settings
- **Language:** English, Español, Português, Deutsch, Français, Русский, 日本語, 한국어.
- **Panel Position:** Left or Right side of the screen.
- **Export:** Download your full purchase history as a JSON file.
- **Clear History:** Permanently wipe all purchases (with confirmation).

### 🎨 UI / UX
- Dark, Path-of-Exile-themed design with gold accents.
- Animated slide-in panel; body margin adjusts so the page content is never hidden.
- Expandable purchase cards with seller, league, search URL, notes, and character info.
- Toast notifications for every action.
- Fully isolated with **Shadow DOM** — never conflicts with the trade site's own styles.
- Panel position and open/close state remembered across sessions.

---

## 🚀 Installation (Developer Mode)

1. Clone or download this repository.
2. Open Chrome and go to `chrome://extensions`.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the repository folder.
5. Navigate to [pathofexile.com/trade2](https://www.pathofexile.com/trade2) — the panel button will appear on the edge of the screen.

---

## 🛠️ How to Use

1. Search for an item on the trade site as you normally would.
2. When you find something you want, click **"Travel to Hideout"** — the purchase is recorded automatically.
3. Open the side panel (the chest icon on the screen edge) to review your history.
4. Click any card to expand it and see full details, add a note, or reassign it to a character.

---

## 📦 Supported Languages for Auto-Detection

The extension detects the "Travel to Hideout" button in:
English · Español · Português · Deutsch · Français · Русский · 日本語 · 한국어

---

## 📄 Historial de Cambios (Changelog - ES)

### v0.1.4 — 2026-06-04
- **Novedad:** Se agregaron los retratos oficiales de las clases de Path of Exile 2 al selector de personajes y al resumen de gastos.
- **Novedad:** Se agregó la capacidad de borrar personajes. Al borrar un personaje, todas sus compras se migran de forma segura a la categoría "Sin Personaje" para no perder el historial.
- **UI:** Se rediseñó el resumen de gastos del personaje para que coincida con el diseño elegante de las cartas de ítem, incluyendo los retratos de clase en tamaño grande.

### v0.1.3 — 2026-06-04
- **Corrección:** El término `annul` (usado en listados como `~b/o 1 annul`) ahora se resuelve correctamente a Orb of Annulment. También se agregaron los términos `scour` y `chrom` para Scouring Orb y Chromatic Orb.

### v0.1.2 — 2026-06-04
- **Corrección:** La detección de divisas ahora reconoce todos los orbes comunes de POE2 y sus abreviaturas: Orb of Augmentation (`aug`), Orb of Transmutation (`trans`), Orb of Alteration (`alt`), Regal Orb, Scroll of Wisdom, Orb of Chance, Blessed Orb, Jeweller's Orb, Gemcutter's Prism (`gcp`), Scouring Orb, Chromatic Orb, Annulment Orb, y más.
- **Corrección:** Se agregó un tercer método de extracción de precio que detecta el patrón `NxNombre Completo de la Divisa` (ej. `1xOrb of Augmentation`) directamente del texto, para que los ítems listados en monedas menos comunes ya no se registren como `0 unknown`.

### v0.1.1 — 2026-06-04
- **Corrección:** El panel lateral ya no se abre y cierra de golpe al actualizar la página. Ahora el panel siempre se inicializa en estado cerrado en cada carga de la página, eliminando el error visual de la animación.

### v0.1.0 — Lanzamiento Inicial
- Seguimiento de compras mediante intercepción del clic en "Travel to Hideout".
- Panel de historial de compras con cartas expandibles/colapsables.
- Borrado seguro (Pestaña papelera) con opciones de restaurar y borrar permanentemente.
- Sistema de personajes con selección de clase y asignación por compra.
- Soporte para 8 idiomas (EN, ES, PT, DE, FR, RU, JA, KO).
- Posicionamiento del panel a la izquierda o derecha.
- Exportación a JSON.
- Aislamiento mediante Shadow DOM.
- Opciones e historial persistentes usando `chrome.storage.local`.

---

## 📄 Changelog (EN)

### v0.1.4 — 2026-06-04
- **Feature:** Added official Path of Exile 2 class portraits to the character selector and spend summary.
- **Feature:** Added the ability to delete characters. Deleting a character safely migrates all their purchases to the "Sin Personaje" (No Character) category so history is not lost.
- **UI:** Revamped the character spend summary layout to match the sleek design of item cards, complete with large class portraits.

### v0.1.3 — 2026-06-04
- **Fix:** `annul` shorthand (used in `~b/o 1 annul` listings) now correctly resolves to Orb of Annulment. Also added `scour` and `chrom` shorthands for Scouring Orb and Chromatic Orb.

### v0.1.2 — 2026-06-04
- **Fix:** Currency detection now recognises all common POE2 orbs and shorthands: Orb of Augmentation (`aug`), Orb of Transmutation (`trans`), Orb of Alteration (`alt`), Regal Orb, Scroll of Wisdom, Orb of Chance, Blessed Orb, Jeweller's Orb, Gemcutter's Prism (`gcp`), Scouring Orb, Chromatic Orb, Annulment Orb, and more.
- **Fix:** Added a third price-extraction fallback that parses `NxFull Currency Name` patterns (e.g. `1xOrb of Augmentation`) directly from the raw text, so items listed in less common currencies are no longer recorded as `0 unknown`.

### v0.1.1 — 2026-06-04
- **Fix:** Side panel no longer flashes open then closed when refreshing the page. The panel now always initialises in the closed state on every page load, eliminating the animation glitch.

### v0.1.0 — Initial Release
- Core purchase tracking via "Travel to Hideout" click interception.
- Purchase history panel with expand/collapse cards.
- Soft-delete (Trash tab) with restore and permanent delete.
- Character system with class selection and per-purchase assignment.
- 8-language support (EN, ES, PT, DE, FR, RU, JA, KO).
- Left/right panel positioning.
- JSON export.
- Shadow DOM isolation.
- Persistent settings and history via `chrome.storage.local`.

---

## 📁 Project Structure

```
poe2-purchase-history/
├── manifest.json          # Extension manifest (MV3)
├── background.js          # Service worker (message relay)
├── content/
│   ├── content.js         # Main injected script — all UI & logic
│   └── content.css        # Panel styles (loaded into Shadow DOM)
├── popup/
│   ├── popup.html         # Extension popup
│   ├── popup.js
│   ├── popup.css
│   └── flags/             # Country flag PNGs for language selector
└── icons/
    ├── chest_16.png
    ├── chest_48.png
    └── chest_128.png
```

---

## 📝 License

MIT
