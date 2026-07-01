# POE2 Purchase History (ES)

Una extensión de Chrome que inyecta un elegante panel lateral en la [página de comercio de Path of Exile 2](https://www.pathofexile.com/trade2), permitiéndote registrar cada ítem que compras sin salir de la página.

---

## ✨ Características

### 📋 Registro de Compras
- Registra automáticamente una compra cuando haces clic en **"Travel to Hideout"** (Viajar a la Guarida) en cualquier resultado de comercio.
- Captura el nombre del ítem, categoría, precio, vendedor, liga y la URL de búsqueda original.
- Detecta la rareza del ítem (Normal, Mágico, Raro, Único, Gema, Divisa) y colorea el nombre en consecuencia.
- Muestra el arte del ítem directamente desde la página de comercio.

### 🗂️ Gestión de Personajes
- Crea personajes con nombre y clase (Witch, Ranger, Mercenary, Warrior, Monk, Sorceress, Druid, Huntress, Shadow, Templar, Marauder, Duelist).
- Asigna compras a un personaje y filtra el historial por personaje.
- Reasigna compras a un personaje diferente en cualquier momento desde la vista expandida de la carta.

### 🗑️ Papelera / Borrado Seguro
- Al borrar una compra, esta se mueve a la pestaña **Papelera** — nada se pierde permanentemente por accidente.
- Restaura compras individuales o vacía toda la papelera a la vez.

### ⭐ Favoritos
- Marcá cualquier compra como favorita con el botón estrella en la carta.
- Los favoritos aparecen al inicio del historial bajo el título **"Favoritos"**, separados del resto por un título **"Items"**.
- Los títulos de sección solo aparecen cuando hay al menos un favorito marcado.
- **Drag & Drop:** Arrastrá las cartas favoritas para reordenarlas libremente — el orden se guarda de forma permanente.
- La estrella es siempre visible y se ilumina en dorado cuando el ítem está marcado como favorito.

### ⚙️ Ajustes
- **Idioma:** Inglés, Español, Portugués, Alemán, Francés, Ruso, Japonés, Coreano.
- **Posición del Panel:** Lado izquierdo o derecho de la pantalla.
- **Exportar:** Descarga tu historial de compras completo como un archivo JSON.
- **Borrar Historial:** Borra permanentemente todas las compras (con confirmación).

### 🎨 Diseño e Interfaz (UI/UX)
- Diseño oscuro temático de Path of Exile con detalles dorados.
- Panel deslizable animado; el margen de la página se ajusta para que el contenido de la web nunca quede oculto.
- Cartas de compra expandibles con información del vendedor, liga, URL, notas y personaje.
- Notificaciones Toast para cada acción.
- Aislamiento completo con **Shadow DOM** — nunca entra en conflicto con los estilos propios de la página de comercio.
- La posición del panel y el estado abierto/cerrado se recuerdan entre sesiones.

---

## 🚀 Instalación (Modo Desarrollador)

1. Clona o descarga este repositorio.
2. Abre Chrome y ve a `chrome://extensions`.
3. Activa el **Modo desarrollador** (interruptor arriba a la derecha).
4. Haz clic en **Cargar descomprimida** y selecciona la carpeta del repositorio.
5. Ve a [pathofexile.com/trade2](https://www.pathofexile.com/trade2) — el botón del panel aparecerá en el borde de la pantalla.

---

## 🛠️ Cómo Usar

1. Busca un ítem en la página de comercio como lo harías normalmente.
2. Cuando encuentres algo que quieras, haz clic en **"Travel to Hideout"** — la compra se registra automáticamente.
3. Abre el panel lateral (el ícono del cofre en el borde de la pantalla) para revisar tu historial.
4. Haz clic en cualquier carta para expandirla y ver los detalles completos, agregar una nota o reasignarla a un personaje.
5. Para reordenar favoritos, simplemente **arrastrá una carta favorita** sobre otra.

---

## 📦 Idiomas Soportados para Auto-Detección

La extensión detecta el botón "Travel to Hideout" en:
Inglés · Español · Portugués · Alemán · Francés · Ruso · Japonés · Coreano

---

## 📄 Historial de Cambios (Changelog)

### v1.2.1 — 2026-07-01
- **Fix:** Los badges de tier de prefijos y sufijos (`P1`, `S2`, `P1 + P3`, etc.) ahora se muestran en el mismo renglón que el stat al que pertenecen. El badge queda alineado a la izquierda y el texto del stat alineado a la derecha, replicando el estilo del tooltip del juego.
- **Versión:** Actualizada a `1.2.1`.

### v1.2.0 — 2026-06-29
- **Mejora UI:** Los stats del ítem en la vista expandida de cada carta ahora se muestran línea a línea (una por renglón) en lugar de todo el texto junto separado por `|`. Cada línea tiene su propio renglón con fondo alternado sutil y un borde dorado tenue, inspirado en el tooltip del juego.
- **Fix:** Se eliminó el ruleset CSS vacío `.poe2ph-spend-badge-normal` que generaba una advertencia de lint.
- **Versión:** Actualizada a `1.2.0`.

### v1.1.9 — 2026-06-15
- **Novedad:** Títulos de sección en el historial — cuando hay favoritos, aparece el encabezado **"Favoritos"** arriba de ellos y **"Items"** antes de los ítems normales. Los títulos no se muestran si no hay ningún favorito marcado.
- **Novedad:** **Drag & Drop para Favoritos** — arrastrá y soltá las cartas favoritas para reordenarlas libremente. El nuevo orden se guarda permanentemente. Solo los favoritos son arrastrables entre sí.
- **Versión:** Actualizada a `1.1.9`.

### v1.1.8 — 2026-06-15
- **Novedad:** Sistema de **Favoritos** — marcá cualquier compra con una estrella para fijarla al inicio del historial. Los favoritos se muestran primero (ordenados por fecha entre ellos), seguidos del resto. La estrella es siempre visible en cada carta y se ilumina en dorado cuando el ítem está marcado.

### v1.1.7 — 2026-06-08
- **Limpieza técnica:** Se removió el permiso inactivo `activeTab` del archivo manifest para cumplir con las políticas de la Chrome Web Store.

### v1.1.6 — 2026-06-06
- **Corrección:** Se corrigió un bug donde hacer clic en el ícono de **ordenar por precio (↓)** guardaba la compra incorrectamente. La detección ahora exige que el elemento sea un `<button>` con la clase CSS `direct-btn`, que el sitio de trade usa exclusivamente para el botón "Travel to Hideout". Esto descarta íconos SVG, flechas de ordenamiento y cualquier otro elemento que no sea ese botón específico.

### v1.1.5 — 2026-06-06
- **Mejora:** Reescritura completa del sistema de detección del botón "Travel to Hideout". Ahora usa tanto coincidencia exacta contra un listado de textos conocidos como coincidencia parcial por palabras clave para todos los idiomas soportados (EN, ES, PT, DE, FR, RU, JA, KO, TH, ZH-TW, ZH-CN).

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

## 📁 Estructura del Proyecto

```
poe2-purchase-history/
├── manifest.json          # Manifiesto de la extensión (MV3)
├── background.js          # Service worker (relevo de mensajes)
├── content/
│   ├── content.js         # Script principal inyectado — toda la UI y lógica
│   └── content.css        # Estilos del panel (cargados en Shadow DOM)
├── popup/
│   ├── popup.html         # Ventana emergente (popup)
│   ├── popup.js
│   ├── popup.css
│   └── flags/             # Banderas PNG para el selector de idiomas
└── icons/
    ├── chest_16.png
    ├── chest_48.png
    └── chest_128.png
```

---

## 📝 Licencia

MIT


<br><br><br>
<hr>
<br><br><br>


# POE2 Purchase History (EN)

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

### ⭐ Favorites
- Mark any purchase as a favourite with the star button on the card.
- Favourites appear at the top of the history list under a **"Favorites"** heading, separated from the rest by an **"Items"** heading.
- Section headings are only shown when at least one favourite is marked.
- **Drag & Drop:** Drag favourite cards to freely reorder them — the order is saved permanently.
- The star is always visible and lights up in gold when the item is marked as a favourite.

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
5. To reorder favourites, simply **drag a favourite card** onto another one.

---

## 📦 Supported Languages for Auto-Detection

The extension detects the "Travel to Hideout" button in:
English · Español · Português · Deutsch · Français · Русский · 日本語 · 한국어

---

## 📄 Changelog (EN)

### v1.2.1 — 2026-07-01
- **Fix:** Prefix/suffix tier badges (`P1`, `S2`, `P1 + P3`, etc.) are now displayed on the same row as the stat they belong to. The badge is left-aligned and the stat text is right-aligned, matching the in-game tooltip style.
- **Version:** Bumped to `1.2.1`.

### v1.2.0 — 2026-06-29
- **UI Improvement:** Item stats in the expanded card view are now displayed line by line (one per row) instead of a single pipe-separated text blob. Each stat gets its own row with a subtle alternating background and a faint gold border, inspired by the in-game item tooltip layout.
- **Fix:** Removed the empty CSS ruleset `.poe2ph-spend-badge-normal` that was triggering a lint warning.
- **Version:** Bumped to `1.2.0`.

### v1.1.9 — 2026-06-15
- **Feature:** Section headings in the history list — when favourites exist, a **"Favorites"** heading appears above them and an **"Items"** heading separates them from normal purchases. Headings are hidden when no favourites are marked.
- **Feature:** **Drag & Drop for Favorites** — drag and drop favourite cards to reorder them freely. The new order is saved permanently to extension storage. Only favourites are draggable among themselves; normal items are unaffected.
- **Version:** Bumped to `1.1.9`.

### v1.1.8 — 2026-06-15
- **Feature:** **Favorites system** — mark any purchase with a star to pin it to the top of the history list. Favourites appear first (sorted by date among themselves), followed by the rest. The star is always visible on every card and lights up in gold when the item is marked as a favourite.

### v1.1.7 — 2026-06-08
- **Maintenance:** Removed the unused `activeTab` permission from the manifest file to comply with Chrome Web Store policies.

### v1.1.6 — 2026-06-06
- **Fix:** Fixed a bug where clicking the **sort-by-price icon (↓)** was incorrectly recording a purchase. Detection now requires the element to be a `<button>` with the CSS class `direct-btn`, which the trade site uses exclusively for the "Travel to Hideout" button. This rules out SVG icons, sort arrows, and any other element that is not that specific button.

### v1.1.5 — 2026-06-06
- **Improvement:** Full rewrite of the "Travel to Hideout" button detection system. Now uses both exact-text matching against a known list and partial keyword matching to support all languages (EN, ES, PT, DE, FR, RU, JA, KO, TH, ZH-TW, ZH-CN).

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
