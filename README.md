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

## 📄 Changelog

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
