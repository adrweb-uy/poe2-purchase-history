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

  const CURRENT_VERSION = '1.2.2';

  /** "Travel to Hideout" button text in all supported languages.
   *  Includes both the trade-site labels AND the in-game button text,
   *  which sometimes differ across localized subdomains. */
  const TRAVEL_TEXTS = new Set([
    // English
    'Travel to Hideout',
    // Spanish (es.pathofexile.com)
    'Viajar al Escondite',
    'Viajar a la guarida',
    'Ir al Escondite',
    // Portuguese (br.pathofexile.com / pt.pathofexile.com)
    'Viajar para o Esconderijo',
    'Ir para o Esconderijo',
    // German (de.pathofexile.com)
    'Zum Versteck reisen',
    'Zum Unterschlupf reisen',
    // French (fr.pathofexile.com)
    'Voyager vers la Cachette',
    'Aller à la Cachette',
    // Russian (ru.pathofexile.com)
    'Перейти в убежище',
    'Телепортироваться в убежище',
    // Japanese (jp.pathofexile.com)
    'ハイドアウトへ移動',
    // Korean (kr.pathofexile.com)
    '은신처로 이동',
    // Thai (th.pathofexile.com)
    'เดินทางไปยังที่ซ่อน',
    // Traditional Chinese (tw.pathofexile.com)
    '前往藏身處',
    // Simplified Chinese (cn.pathofexile.com)
    '前往据点',
  ]);

  const CATEGORY_ICONS = {
    weapon: '⚔️', armor: '🛡️', accessory: '💍',
    jewel: '💎', gem: '🔮', currency: '🪙',
    flask: '⚗️', map: '🗺️', other: '📦',
  };

  const CURRENCY_DISPLAY = {
    divine:        'Divine',
    chaos:         'Chaos',
    exalted:       'Exalted',
    mirror:        'Mirror',
    gold:          'Gold',
    vaal:          'Vaal',
    alch:          'Alch',
    fusing:        'Fusing',
    alteration:    'Alt',
    augmentation:  'Aug',
    transmutation: 'Trans',
    regal:         'Regal',
    wisdom:        'Wisdom',
    chance:        'Chance',
    blessed:       'Blessed',
    jewellers:     "Jeweller's",
    gemcutters:    'GCP',
    scouring:      'Scour',
    chromatic:     'Chrom',
    annulment:     'Annul',
    ancient:       'Ancient',
    lesser:        'Lesser',
    greater:       'Greater',
    perfect:       'Perfect',
  };

  const CLASS_INFO = {
    witch:     { name: 'Witch',     emoji: '🧙‍♀️', color: '#3a0a6a', accent: '#b060ff',
                 portrait: 'icons/classes/witch.webp' },
    ranger:    { name: 'Ranger',    emoji: '🏹',    color: '#0a3a1a', accent: '#40c070',
                 portrait: 'icons/classes/ranger.webp' },
    mercenary: { name: 'Mercenary', emoji: '🎯',    color: '#3a1a0a', accent: '#c08040',
                 portrait: 'icons/classes/mercenary.webp' },
    warrior:   { name: 'Warrior',   emoji: '🛡️',    color: '#3a0a0a', accent: '#c04040',
                 portrait: 'icons/classes/warrior.webp' },
    monk:      { name: 'Monk',      emoji: '🧘',    color: '#0a1a3a', accent: '#4080c0',
                 portrait: 'icons/classes/monk.webp' },
    sorceress: { name: 'Sorceress', emoji: '⚡',    color: '#0a0a3a', accent: '#6060ff',
                 portrait: 'icons/classes/sorceress.webp' },
    druid:     { name: 'Druid',     emoji: '🐻',    color: '#1a3a0a', accent: '#80c040',
                 portrait: 'icons/classes/druid.webp' },
    huntress:  { name: 'Huntress',  emoji: '🐆',    color: '#2a1a0a', accent: '#c07020',
                 portrait: 'icons/classes/huntress.webp' },
    shadow:    { name: 'Shadow',    emoji: '👤',    color: '#0a0a1a', accent: '#6060a0',
                 portrait: '' },
    templar:   { name: 'Templar',   emoji: '⛪',    color: '#2a1a00', accent: '#c0a000',
                 portrait: '' },
    marauder:  { name: 'Marauder',  emoji: '💪',    color: '#2a0000', accent: '#c02000',
                 portrait: '' },
    duelist:   { name: 'Duelist',   emoji: '🤺',    color: '#0a1a2a', accent: '#2080c0',
                 portrait: '' },
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
        text:       'POE2 Purchase History has been updated to version {version}.',
      },
      tabs: { history: 'History', trash: 'Trash', settings: 'Settings' },
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
        duplicateName: 'A character with that name already exists.',
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
        restore:   'Restore',
        deletePermanent: 'Delete permanently',
        sectionFavorites: 'Favorites',
        sectionItems: 'Items',
      },
      trash: {
        emptyBtn: 'Empty Trash',
        emptyConfirm: 'Are you sure you want to empty the trash permanently?',
        empty: 'Trash is empty.',
        emptyHint: 'Deleted purchases will appear here.',
      },
      settings: {
        language:          'Language',
        languageDesc:      'Choose the language for the extension interface.',
        panelPosition:     'Panel Position',
        panelPositionDesc: 'Choose which side of the screen the panel appears on.',
        left: 'Left', right: 'Right', reset: 'Reset',
        defaultFavorite:     'Default Purchase Mode',
        defaultFavoriteDesc: 'Choose whether new purchases are saved as Normal or Favorite.',
        normal:   'Normal',
        favorite: 'Favorite',
        export:     'Export History',
        exportDesc: 'Export your purchase history as a JSON file.',
        exportBtn:  'Export JSON',
        clearHistory: 'Clear History',
        clearHistoryDesc: 'Permanently delete all recorded purchases.',
        clearBtn:     'Clear All',
        clearConfirm: 'Are you sure? This cannot be undone.',
        clearChars:       'Clear All Characters',
        clearCharsDesc:   'Delete all characters. Their items will be unassigned.',
        clearCharsBtn:    'Delete All Characters',
        clearCharsConfirm: 'Are you sure? All characters will be permanently deleted.',
        version:      'Version',
      },
      categories: {
        weapon: 'Weapon', armor: 'Armor', accessory: 'Accessory',
        jewel: 'Jewel', gem: 'Gem', currency: 'Currency',
        flask: 'Flask', map: 'Map', other: 'Other',
      },
      toast: {
        purchased: '✅ Purchase recorded!',
        deleted:   'Moved to trash.',
        restored:  'Purchase restored.',
        trashCleared: 'Trash emptied.',
        cleared:   'History cleared.',
        exported:  'History exported.',
      },
    },
    es: {
      appName:    'POE2 Historial de Compras',
      appSubtitle: 'Compañero de Trade',
      banner: {
        title:      'NUEVA VERSIÓN',
        text:       'POE2 Historial de Compras se actualizó a la versión {version}.',
      },
      tabs: { history: 'Historial', trash: 'Borrado', settings: 'Ajustes' },
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
        duplicateName: 'Ya existe un personaje con ese nombre.',
      },
      classes: {
        witch: 'Bruja', ranger: 'Exploradora', mercenary: 'Mercenario',
        warrior: 'Guerrero', monk: 'Monje', sorceress: 'Hechicera',
        druid: 'Druida', huntress: 'Cazadora', shadow: 'Sombra',
        templar: 'Templario', marauder: 'Karui', duelist: 'Duelista',
      },
      history: {
        empty:     'Aún no hay compras registradas.',
        emptyHint: "Hacé clic en 'Viajar al Escondite' en un resultado de trade para registrar la compra.",
        seller:    'Vendedor', price: 'Precio', league: 'Liga',
        notes:     'Agregar nota…', delete: 'Eliminar',
        category:  'Categoría', searchUrl: 'URL de búsqueda',
        openSearch: 'Abrir búsqueda',
        restore:   'Restaurar',
        deletePermanent: 'Eliminar permanentemente',
        sectionFavorites: 'Favoritos',
        sectionItems: 'Items',
      },
      trash: {
        emptyBtn: 'Vaciar Papelera',
        emptyConfirm: '¿Estás seguro de que querés vaciar la papelera permanentemente?',
        empty: 'La papelera está vacía.',
        emptyHint: 'Las compras eliminadas aparecerán acá.',
      },
      settings: {
        language:          'Idioma',
        languageDesc:      'Elegí el idioma de la interfaz de la extensión.',
        panelPosition:     'Posición del Panel',
        panelPositionDesc: 'Elegí en qué lado de la pantalla aparece el panel.',
        left: 'Izquierda', right: 'Derecha', reset: 'Restablecer',
        defaultFavorite:     'Modo de Compra por Defecto',
        defaultFavoriteDesc: 'Elegí si las compras nuevas se guardan como Normal o Favorito.',
        normal:   'Normal',
        favorite: 'Favorito',
        export:     'Exportar Historial',
        exportDesc: 'Exportá tu historial de compras como archivo JSON.',
        exportBtn:  'Exportar JSON',
        clearHistory: 'Limpiar Historial',
        clearHistoryDesc: 'Eliminá permanentemente todas las compras registradas.',
        clearBtn:     'Limpiar Todo',
        clearConfirm: '¿Estás seguro? Esta acción no se puede deshacer.',
        clearChars:       'Borrar Todos los Personajes',
        clearCharsDesc:   'Eliminá todos los personajes. Sus items quedarán sin asignar.',
        clearCharsBtn:    'Borrar Todos los Personajes',
        clearCharsConfirm: '¿Estás seguro? Todos los personajes se eliminarán permanentemente.',
        version:      'Versión',
      },
      categories: {
        weapon: 'Arma', armor: 'Armadura', accessory: 'Accesorio',
        jewel: 'Joya', gem: 'Gema', currency: 'Divisa',
        flask: 'Frasco', map: 'Mapa', other: 'Otro',
      },
      toast: {
        purchased: '✅ ¡Compra registrada!',
        deleted:   'Compra enviada a la papelera.',
        restored:  'Compra restaurada.',
        trashCleared: 'Papelera vaciada.',
        cleared:   'Historial limpiado.',
        exported:  'Historial exportado.',
      },
    },
    pt: {
      appName:    'POE2 Histórico de Compras',
      appSubtitle: 'Companheiro de Trade',
      banner: {
        title:      'NOVA VERSÃO',
        text:       'O POE2 Histórico de Compras foi atualizado para a versão {version}.',
      },
      tabs: { history: 'Histórico', trash: 'Lixeira', settings: 'Opções' },
      charBar: {
        label: 'Personagem:',
        all: 'Todos os Personagens',
        none: 'Sem Personagem',
        newBtn: 'Novo',
        placeholder: 'Nome do personagem...',
        createBtn: 'Criar',
        cancelBtn: 'Cancelar',
        selectClass: 'Classe',
        charLabel: 'Personagem',
        moveTo: 'Mover para:',
        titleNew: 'Criar Novo Personagem',
        duplicateName: 'Já existe um personagem com esse nome.',
      },
      classes: {
        witch: 'Bruxa', ranger: 'Arqueira', mercenary: 'Mercenário',
        warrior: 'Guerreiro', monk: 'Monge', sorceress: 'Feiticeira',
        druid: 'Druida', huntress: 'Caçadora', shadow: 'Assassino',
        templar: 'Templário', marauder: 'Bárbaro', duelist: 'Duelista',
      },
      history: {
        empty:     'Nenhuma compra registrada ainda.',
        emptyHint: "Clique em 'Viajar para o Esconderijo' em qualquer resultado de trade para registrar uma compra automaticamente.",
        seller:    'Vendedor', price: 'Preço', league: 'Liga',
        notes:     'Adicionar nota…', delete: 'Excluir',
        category:  'Categoria', searchUrl: 'URL de busca',
        openSearch: 'Abrir busca',
        restore:   'Restaurar',
        deletePermanent: 'Excluir permanentemente',
        sectionFavorites: 'Favoritos',
        sectionItems: 'Itens',
      },
      trash: {
        emptyBtn: 'Esvaziar Lixeira',
        emptyConfirm: 'Tem certeza de que deseja esvaziar a lixeira permanentemente?',
        empty: 'A lixeira está vazia.',
        emptyHint: 'As compras excluídas aparecerão aqui.',
      },
      settings: {
        language:          'Idioma',
        languageDesc:      'Escolha o idioma da interface da extensão.',
        panelPosition:     'Posição do Painel',
        panelPositionDesc: 'Escolha em qual lado da tela o painel deve aparecer.',
        left: 'Esquerda', right: 'Direita', reset: 'Redefinir',
        defaultFavorite:     'Modo Padrão de Compra',
        defaultFavoriteDesc: 'Escolha se as novas compras são salvas como Normal ou Favorito.',
        normal:   'Normal',
        favorite: 'Favorito',
        export:     'Exportar Histórico',
        exportDesc: 'Exportar seu histórico de compras como um arquivo JSON.',
        exportBtn:  'Exportar JSON',
        clearHistory: 'Limpar Histórico',
        clearHistoryDesc: 'Excluir permanentemente todas as compras registradas.',
        clearBtn:     'Limpar Tudo',
        clearConfirm: 'Tem certeza? Esta ação não pode ser desfeita.',
        clearChars:       'Apagar Todos os Personagens',
        clearCharsDesc:   'Exclua todos os personagens. Seus itens ficarão sem atribuição.',
        clearCharsBtn:    'Apagar Todos os Personagens',
        clearCharsConfirm: 'Tem certeza? Todos os personagens serão excluídos permanentemente.',
        version:      'Versão',
      },
      categories: {
        weapon: 'Arma', armor: 'Armadura', accessory: 'Acessório',
        jewel: 'Joia', gem: 'Gema', currency: 'Moeda',
        flask: 'Frasco', map: 'Mapa', other: 'Outro',
      },
      toast: {
        purchased: '✅ Compra registrada!',
        deleted:   'Enviado para a lixeira.',
        restored:  'Compra restaurada.',
        trashCleared: 'Lixeira esvaziada.',
        cleared:   'Histórico limpo.',
        exported:  'Histórico exportado.',
      },
    },
    de: {
      appName:    'POE2 Kaufhistorie',
      appSubtitle: 'Handelsbegleiter',
      banner: {
        title:      'NEUE VERSION',
        text:       'POE2 Kaufhistorie wurde auf Version {version} aktualisiert.',
      },
      tabs: { history: 'Verlauf', trash: 'Papierkorb', settings: 'Einstellungen' },
      charBar: {
        label: 'Charakter:',
        all: 'Alle Charaktere',
        none: 'Kein Charakter',
        newBtn: 'Neu',
        placeholder: 'Charaktername...',
        createBtn: 'Erstellen',
        cancelBtn: 'Abbrechen',
        selectClass: 'Klasse wählen',
        charLabel: 'Charakter',
        moveTo: 'Verschieben nach:',
        titleNew: 'Neuen Charakter erstellen',
        duplicateName: 'Ein Charakter mit diesem Namen existiert bereits.',
      },
      classes: {
        witch: 'Hexe', ranger: 'Waldläuferin', mercenary: 'Söldner',
        warrior: 'Krieger', monk: 'Mönch', sorceress: 'Magierin',
        druid: 'Druide', huntress: 'Jägerin', shadow: 'Schatten',
        templar: 'Templer', marauder: 'Marodeur', duelist: 'Duellant',
      },
      history: {
        empty:     'Noch keine Käufe aufgezeichnet.',
        emptyHint: "Klicke bei einem Handelsergebnis auf 'Zum Versteck reisen', um einen Kauf automatisch aufzuzeichnen.",
        seller:    'Verkäufer', price: 'Preis', league: 'Liga',
        notes:     'Notiz hinzufügen…', delete: 'Löschen',
        category:  'Kategorie', searchUrl: 'Such-URL',
        openSearch: 'Suche öffnen',
        restore:   'Wiederherstellen',
        deletePermanent: 'Endgültig löschen',
        sectionFavorites: 'Favoriten',
        sectionItems: 'Elemente',
      },
      trash: {
        emptyBtn: 'Papierkorb leeren',
        emptyConfirm: 'Möchtest du den Papierkorb wirklich endgültig leeren?',
        empty: 'Papierkorb ist leer.',
        emptyHint: 'Gelöschte Käufe werden hier angezeigt.',
      },
      settings: {
        language:          'Sprache',
        languageDesc:      'Wähle die Sprache für die Erweiterungsoberfläche.',
        panelPosition:     'Panel-Position',
        panelPositionDesc: 'Wähle, auf welcher Seite des Bildschirms das Panel angezeigt wird.',
        left: 'Links', right: 'Rechts', reset: 'Zurücksetzen',
        defaultFavorite:     'Standard-Kaufmodus',
        defaultFavoriteDesc: 'Wähle, ob neue Käufe als Normal oder als Favorit gespeichert werden.',
        normal:   'Normal',
        favorite: 'Favorit',
        export:     'Verlauf exportieren',
        exportDesc: 'Exportiere deinen Kaufverlauf als JSON-Datei.',
        exportBtn:  'JSON exportieren',
        clearHistory: 'Verlauf löschen',
        clearHistoryDesc: 'Lösche alle aufgezeichneten Käufe endgültig.',
        clearBtn:     'Alles löschen',
        clearConfirm: 'Bist du sicher? Dies kann nicht rückgängig gemacht werden.',
        clearChars:       'Alle Charaktere löschen',
        clearCharsDesc:   'Lösche alle Charaktere. Ihre Items werden nicht mehr zugeordnet.',
        clearCharsBtn:    'Alle Charaktere löschen',
        clearCharsConfirm: 'Bist du sicher? Alle Charaktere werden dauerhaft gelöscht.',
        version:      'Version',
      },
      categories: {
        weapon: 'Waffe', armor: 'Rüstung', accessory: 'Schmuck',
        jewel: 'Juwel', gem: 'Gemme', currency: 'Währung',
        flask: 'Fläschchen', map: 'Karte', other: 'Anderes',
      },
      toast: {
        purchased: '✅ Kauf aufgezeichnet!',
        deleted:   'In den Papierkorb verschoben.',
        restored:  'Kauf wiederhergestellt.',
        trashCleared: 'Papierkorb geleert.',
        cleared:   'Verlauf gelöscht.',
        exported:  'Verlauf exportiert.',
      },
    },
    fr: {
      appName:    'POE2 Historique des Achats',
      appSubtitle: 'Compagnon de Trade',
      banner: {
        title:      'NOUVELLE VERSION',
        text:       'L’historique des achats POE2 a été mis à jour vers la version {version}.',
      },
      tabs: { history: 'Historique', trash: 'Corbeille', settings: 'Paramètres' },
      charBar: {
        label: 'Personnage :',
        all: 'Tous les Personnages',
        none: 'Aucun Personnage',
        newBtn: 'Nouveau',
        placeholder: 'Nom du personnage...',
        createBtn: 'Créer',
        cancelBtn: 'Annuler',
        selectClass: 'Sélectionner la classe',
        charLabel: 'Personnage',
        moveTo: 'Déplacer vers :',
        titleNew: 'Créer un nouveau personnage',
        duplicateName: 'Un personnage avec ce nom existe déjà.',
      },
      classes: {
        witch: 'Sorcière', ranger: 'Chasseresse', mercenary: 'Mercenaire',
        warrior: 'Guerrier', monk: 'Moine', sorceress: 'Enchanteresse',
        druid: 'Druide', huntress: 'Traqueuse', shadow: 'Ombre',
        templar: 'Templier', marauder: 'Maraudeur', duelist: 'Duelliste',
      },
      history: {
        empty:     'Aucun achat enregistré pour le moment.',
        emptyHint: "Cliquez sur 'Voyager vers la Cachette' sur n'importe quel résultat pour enregistrer automatiquement un achat.",
        seller:    'Vendeur', price: 'Prix', league: 'Ligue',
        notes:     'Ajouter une note…', delete: 'Supprimer',
        category:  'Catégorie', searchUrl: 'URL de recherche',
        openSearch: 'Ouvrir la recherche',
        restore:   'Restaurer',
        deletePermanent: 'Supprimer définitivement',
        sectionFavorites: 'Favoris',
        sectionItems: 'Objets',
      },
      trash: {
        emptyBtn: 'Vider la corbeille',
        emptyConfirm: 'Voulez-vous vraiment vider la corbeille définitivement ?',
        empty: 'La corbeille est vide.',
        emptyHint: 'Les achats supprimés apparaîtront ici.',
      },
      settings: {
        language:          'Langue',
        languageDesc:      'Choisissez la langue pour l’interface de l’extension.',
        panelPosition:     'Position du panneau',
        panelPositionDesc: 'Choisissez le côté de l’écran où le panneau s’affiche.',
        left: 'Gauche', right: 'Droite', reset: 'Réinitialiser',
        defaultFavorite:     'Mode d’achat par défaut',
        defaultFavoriteDesc: 'Choisissez si les nouveaux achats sont enregistrés comme Normal ou Favori.',
        normal:   'Normal',
        favorite: 'Favori',
        export:     'Exporter l’historique',
        exportDesc: 'Exportez votre historique d’achats dans un fichier JSON.',
        exportBtn:  'Exporter le JSON',
        clearHistory: 'Effacer l’historique',
        clearHistoryDesc: 'Supprimer définitivement tous les achats enregistrés.',
        clearBtn:     'Tout effacer',
        clearConfirm: 'Êtes-vous sûr ? Cette action est irréversible.',
        clearChars:       'Supprimer tous les personnages',
        clearCharsDesc:   'Supprimez tous les personnages. Leurs objets seront non attribués.',
        clearCharsBtn:    'Supprimer tous les personnages',
        clearCharsConfirm: 'Êtes-vous sûr ? Tous les personnages seront supprimés définitivement.',
        version:      'Version',
      },
      categories: {
        weapon: 'Arme', armor: 'Armure', accessory: 'Accessoire',
        jewel: 'Joyau', gem: 'Gemme', currency: 'Monnaie',
        flask: 'Flacon', map: 'Carte', other: 'Autre',
      },
      toast: {
        purchased: '✅ Achat enregistré !',
        deleted:   'Déplacé dans la corbeille.',
        restored:  'Achat restauré.',
        trashCleared: 'Corbeille vidée.',
        cleared:   'Historique effacé.',
        exported:  'Historique exporté.',
      },
    },
    ru: {
      appName:    'POE2 История покупок',
      appSubtitle: 'Торговый компаньон',
      banner: {
        title:      'НОВАЯ ВЕРСИЯ',
        text:       'История покупок POE2 обновлена до версии {version}.',
      },
      tabs: { history: 'История', trash: 'Удаленные', settings: 'Настройки' },
      charBar: {
        label: 'Персонаж:',
        all: 'Все персонажи',
        none: 'Без персонажа',
        newBtn: 'Новый',
        placeholder: 'Имя персонажа...',
        createBtn: 'Создать',
        cancelBtn: 'Отмена',
        selectClass: 'Выберите класс',
        charLabel: 'Персонаж',
        moveTo: 'Переместить в:',
        titleNew: 'Создать нового персонажа',
        duplicateName: 'Персонаж с таким именем уже существует.',
      },
      classes: {
        witch: 'Ведьма', ranger: 'Охотница', mercenary: 'Наемник',
        warrior: 'Воин', monk: 'Монах', sorceress: 'Заклинательница',
        druid: 'Друид', huntress: 'Следопыт', shadow: 'Бандит',
        templar: 'Жрец', marauder: 'Дикарь', duelist: 'Дуэлянт',
      },
      history: {
        empty:     'Покупки еще не записаны.',
        emptyHint: "Нажмите 'Перейти в убежище' на любом объявлении, чтобы записать покупку автоматически.",
        seller:    'Продавец', price: 'Цена', league: 'Лига',
        notes:     'Добавить заметку…', delete: 'Удалить',
        category:  'Категория', searchUrl: 'Ссылка поиска',
        openSearch: 'Открыть поиск',
        restore:   'Восстановить',
        deletePermanent: 'Удалить навсегда',
        sectionFavorites: 'Избранное',
        sectionItems: 'Предметы',
      },
      trash: {
        emptyBtn: 'Очистить корзину',
        emptyConfirm: 'Вы уверены, что хотите навсегда очистить корзину?',
        empty: 'Корзина пуста.',
        emptyHint: 'Удаленные покупки появятся здесь.',
      },
      settings: {
        language:          'Язык',
        languageDesc:      'Выберите язык интерфейса расширения.',
        panelPosition:     'Положение панели',
        panelPositionDesc: 'Выберите, с какой стороны экрана отображать панель.',
        left: 'Слева', right: 'Справа', reset: 'Сбросить',
        defaultFavorite:     'Режим покупки по умолчанию',
        defaultFavoriteDesc: 'Выберите, сохранять ли новые покупки как Обычное или Избранное.',
        normal:   'Обычное',
        favorite: 'Избранное',
        export:     'Экспорт истории',
        exportDesc: 'Экспортируйте историю покупок в виде файла JSON.',
        exportBtn:  'Экспорт JSON',
        clearHistory: 'Очистить историю',
        clearHistoryDesc: 'Навсегда удалить все записанные покупки.',
        clearBtn:     'Очистить всё',
        clearConfirm: 'Вы уверены? Это действие невозможно отменить.',
        clearChars:       'Удалить всех персонажей',
        clearCharsDesc:   'Удалите всех персонажей. Их предметы станут неназначенными.',
        clearCharsBtn:    'Удалить всех персонажей',
        clearCharsConfirm: 'Вы уверены? Все персонажи будут удалены навсегда.',
        version:      'Версия',
      },
      categories: {
        weapon: 'Оружие', armor: 'Доспехи', accessory: 'Аксессуары',
        jewel: 'Самоцветы', gem: 'Камни умений', currency: 'Валюта',
        flask: 'Флаконы', map: 'Карты', other: 'Другое',
      },
      toast: {
        purchased: '✅ Покупка записана!',
        deleted:   'Перемещено в корзину.',
        restored:  'Покупка восстановлена.',
        trashCleared: 'Корзина очищена.',
        cleared:   'История очищена.',
        exported:  'История экспортирована.',
      },
    },
    ja: {
      appName:    'POE2 購入履歴',
      appSubtitle: 'トレードコンパニオン',
      banner: {
        title:      '新バージョン',
        text:       'POE2購入履歴がバージョン{version}にアップデートされました。',
      },
      tabs: { history: '履歴', trash: 'ゴミ箱', settings: '設定' },
      charBar: {
        label: 'キャラクター:',
        all: 'すべてのキャラクター',
        none: 'キャラクターなし',
        newBtn: '新規',
        placeholder: 'キャラクター名...',
        createBtn: '作成',
        cancelBtn: 'キャンセル',
        selectClass: 'クラスを選択',
        charLabel: 'キャラクター',
        moveTo: '移動先:',
        titleNew: '新しいキャラクターを作成',
        duplicateName: 'その名前のキャラクターはすでに存在します。',
      },
      classes: {
        witch: 'ウィッチ', ranger: 'レンジャー', mercenary: 'マーセナリー',
        warrior: 'ウォリアー', monk: 'モンク', sorceress: 'ソーサレス',
        druid: 'ドルイド', huntress: 'ハントレス', shadow: 'シャドウ',
        templar: 'テンプラー', marauder: 'マローダー', duelist: 'デュエリスト',
      },
      history: {
        empty:     '購入履歴はまだありません。',
        emptyHint: "トレード結果の「ハイドアウトへ移動」をクリックすると、自動的に購入が記録されます。",
        seller:    '販売者', price: '価格', league: 'リーグ',
        notes:     'メモを追加…', delete: '削除',
        category:  'カテゴリー', searchUrl: '検索URL',
        openSearch: '検索を開く',
        restore:   '復元',
        deletePermanent: '完全に削除',
        sectionFavorites: 'お気に入り',
        sectionItems: 'アイテム',
      },
      trash: {
        emptyBtn: 'ゴミ箱を空にする',
        emptyConfirm: '本当にゴミ箱を完全に空にしますか？',
        empty: 'ゴミ箱は空です。',
        emptyHint: '削除された購入履歴がここに表示されます。',
      },
      settings: {
        language:          '言語',
        languageDesc:      '拡張機能インターフェースの言語を選択します。',
        panelPosition:     'パネル位置',
        panelPositionDesc: 'パネルを表示する画面の端を選択します。',
        left: '左', right: '右', reset: 'リセット',
        defaultFavorite:     'デフォルト購入モード',
        defaultFavoriteDesc: '新しい購入をノーマルまたはお気に入りとして保存するかを選択します。',
        normal:   'ノーマル',
        favorite: 'お気に入り',
        export:     '履歴の書き出し',
        exportDesc: '購入履歴をJSONファイルとして書き出します。',
        exportBtn:  'JSONを書き出す',
        clearHistory: '履歴の消去',
        clearHistoryDesc: '記録されたすべての購入履歴を完全に削除します。',
        clearBtn:     'すべて消去',
        clearConfirm: '本当によろしいですか？この操作は取り消せません。',
        clearChars:       'すべてのキャラクターを削除',
        clearCharsDesc:   'すべてのキャラクターを削除します。アイテムは未割り当てになります。',
        clearCharsBtn:    'すべてのキャラクターを削除',
        clearCharsConfirm: '本当に削除しますか？この操作は取り消せません。',
        version:      'バージョン',
      },
      categories: {
        weapon: '武器', armor: '防具', accessory: '装飾品',
        jewel: 'ジュエル', gem: 'ジェム', currency: 'カレンシー',
        flask: 'フラスコ', map: 'マップ', other: 'その他',
      },
      toast: {
        purchased: '✅ 購入が記録されました！',
        deleted:   'ゴミ箱に移動しました。',
        restored:  '購入履歴を復元しました。',
        trashCleared: 'ゴミ箱を空にしました。',
        cleared:   '履歴を消去しました。',
        exported:  '履歴を書き出しました。',
      },
    },
    ko: {
      appName:    'POE2 구매 내역',
      appSubtitle: '거래 동반자',
      banner: {
        title:      '새 버전',
        text:       'POE2 구매 내역이 {version} 버전으로 업데이트되었습니다.',
      },
      tabs: { history: '내역', trash: '휴지통', settings: '설정' },
      charBar: {
        label: '캐릭터:',
        all: '모든 캐릭터',
        none: '캐릭터 없음',
        newBtn: '새 캐릭터',
        placeholder: '캐릭터 이름...',
        createBtn: '생성',
        cancelBtn: '취소',
        selectClass: '클래스 선택',
        charLabel: '캐릭터',
        moveTo: '이동 대상:',
        titleNew: '새 캐릭터 생성',
        duplicateName: '해당 이름의 캐릭터가 이미 존재합니다.',
      },
      classes: {
        witch: '위치', ranger: '레인저', mercenary: '머서너리',
        warrior: '워리어', monk: '몽크', sorceress: '소서리스',
        druid: '드루이드', huntress: '헌트ريس', shadow: '섀도우',
        templar: '템플러', marauder: '머로더', duelist: '듀얼리스트',
      },
      history: {
        empty:     '기록된 구매 내역이 없습니다.',
        emptyHint: "거래 결과의 '은신처로 이동' 버튼을 클릭하면 구매가 자동으로 기록됩니다.",
        seller:    '판매자', price: '가격', league: '리그',
        notes:     '메모 추가…', delete: '삭제',
        category:  '카테고리', searchUrl: '검색 URL',
        openSearch: '검색 열기',
        restore:   '복구',
        deletePermanent: '영구 삭제',
        sectionFavorites: '즐겨찾기',
        sectionItems: '아이템',
      },
      trash: {
        emptyBtn: '휴지통 비우기',
        emptyConfirm: '정말로 휴지통을 영구히 비우시겠습니까?',
        empty: '휴지통이 비어 있습니다.',
        emptyHint: '삭제된 구매 내역이 여기에 표시됩니다.',
      },
      settings: {
        language:          '언어',
        languageDesc:      '확장 프로그램 인터페이스의 언어를 선택합니다.',
        panelPosition:     '패널 위치',
        panelPositionDesc: '패널이 표시될 화면의 방향을 선택합니다.',
        left: '왼쪽', right: '오른쪽', reset: '재설정',
        defaultFavorite:     '기본 구매 모드',
        defaultFavoriteDesc: '새 구매를 일반 또는 즐겨찾기로 저장할지 선택합니다.',
        normal:   '일반',
        favorite: '즐겨찾기',
        export:     '내역 내보내기',
        exportDesc: '구매 내역을 JSON 파일로 내보냅니다.',
        exportBtn:  'JSON 내보내기',
        clearHistory: '내역 삭제',
        clearHistoryDesc: '기록된 모든 구매 내역을 영구히 삭제합니다.',
        clearBtn:     '모두 삭제',
        clearConfirm: '정말이십니까? 이 작업은 취소할 수 없습니다.',
        clearChars:       '모든 캐릭터 삭제',
        clearCharsDesc:   '모든 캐릭터를 삭제합니다. 아이템은 미할당 상태가 됩니다.',
        clearCharsBtn:    '모든 캐릭터 삭제',
        clearCharsConfirm: '정말이십니까? 모든 캐릭터가 영구히 삭제됩니다.',
        version:      '버전',
      },
      categories: {
        weapon: '무기', armor: '방어구', accessory: '장신구',
        jewel: '주얼', gem: '젬', currency: '화폐',
        flask: '플라스크', map: '지도', other: '기타',
      },
      toast: {
        purchased: '✅ 구매가 기록되었습니다!',
        deleted:   '휴지통으로 이동했습니다.',
        restored:  '구매 내역이 복구되었습니다.',
        trashCleared: '휴지통을 비웠습니다.',
        cleared:   '내역이 삭제되었습니다.',
        exported:  '내역을 내보냈습니다.',
      },
    },
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
    async getSettings()          { return this._get('poe2ph_settings', { language: 'en', panelPosition: 'right', sidebarOpen: false, activeCharacterId: 'all', defaultFavorite: false }); },
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
      const p = list.find(x => x.id === id);
      if (p) { p.deleted = true; await this.setPurchases(list); }
    },
    async restorePurchase(id) {
      const list = await this.getPurchases();
      const p = list.find(x => x.id === id);
      if (p) { p.deleted = false; await this.setPurchases(list); }
    },
    async deletePurchasePermanent(id) {
      const list = await this.getPurchases();
      await this.setPurchases(list.filter(p => p.id !== id));
    },
    async clearTrash() {
      const list = await this.getPurchases();
      await this.setPurchases(list.filter(p => !p.deleted));
    },
    async updateNote(id, note) {
      const list = await this.getPurchases();
      const p = list.find(x => x.id === id);
      if (p) { p.notes = note; await this.setPurchases(list); }
    },
    async toggleFavorite(id) {
      const list = await this.getPurchases();
      const p = list.find(x => x.id === id);
      if (p) { p.favorite = !p.favorite; await this.setPurchases(list); return p.favorite; }
      return false;
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
      if (!btn) return null;

      // 1. Direct match with standard PoE trade result containers
      const resultRow = btn.closest('.result') || btn.closest('.row') || btn.closest('.itemElement');
      if (resultRow) return resultRow;

      // 2. Walk up and find the first ancestor that contains a header container (bulletproof)
      let el = btn.parentElement;
      for (let depth = 0; depth < 15 && el; depth++) {
        if (el.querySelector('.itemHeader') || el.querySelector('.item-header') || el.querySelector('[class*="Header"]')) {
          return el;
        }
        el = el.parentElement;
      }

      // 3. Backup fallback: 6 levels up
      el = btn;
      for (let i = 0; i < 6 && el; i++) el = el.parentElement;
      return el;
    },

    _name(row) {
      if (!row) return 'Unknown Item';

      // 1. Try to find the item header container
      const header = row.querySelector('.itemHeader') || row.querySelector('.item-header') || row.querySelector('[class*="Header"]');
      if (header) {
        // Splitting by lines in the header is extremely reliable for combining itemName and typeLine
        const lines = header.innerText.split('\n').map(s => s.trim()).filter(Boolean);
        const filteredLines = lines.filter(l => {
          const lLower = l.toLowerCase();
          return lLower !== 'verified' && lLower !== 'online' && lLower !== 'offline' && lLower !== 'corrupted' && lLower !== 'mirrored';
        });
        if (filteredLines.length > 0) {
          const uniqueLines = [];
          for (const line of filteredLines) {
            if (!uniqueLines.includes(line)) uniqueLines.push(line);
          }
          return uniqueLines.join(' ');
        }
      }

      // 2. Direct elements fallback
      const itemNameEl = row.querySelector('.itemName') || row.querySelector('.item-name') || row.querySelector('[class*="itemName"]');
      const typeLineEl = row.querySelector('.typeLine') || row.querySelector('.type-line') || row.querySelector('[class*="typeLine"]');
      const nameText = itemNameEl?.textContent?.trim() || '';
      const typeText = typeLineEl?.textContent?.trim() || '';

      if (nameText && nameText.toLowerCase() !== 'verified') {
        if (typeText && typeText !== nameText) return `${nameText} ${typeText}`;
        return nameText;
      } else if (typeText) {
        return typeText;
      }

      // 3. Fallback to row text lines (ignoring status words, account names, and prices)
      const lines = (row.innerText || '').split('\n').map(s => s.trim()).filter(Boolean);
      const filtered = lines.filter(l => {
        const lLower = l.toLowerCase();
        return lLower !== 'verified' && lLower !== 'online' && lLower !== 'offline' &&
               !lLower.startsWith('acc:') && !l.includes('Exalted') && !l.includes('Chaos') &&
               !l.includes('Divine') && !l.includes('Mirror') && !l.includes('Gold') &&
               lLower !== 'corrupted' && lLower !== 'mirrored';
      });

      if (filtered.length >= 2) {
        const second = filtered[1];
        if (second.length > 2 && !/^\d+/.test(second) && !second.includes('Level') && !second.includes('Requires')) {
          return `${filtered[0]} ${filtered[1]}`;
        }
      }
      return filtered[0] || 'Unknown Item';
    },

    _price(row) {
      if (!row) return { amount: 0, currency: 'unknown' };

      // Helper: map a raw currency string to a known key
      const _mapCurrency = (raw) => {
        const s = raw.toLowerCase().replace(/[^a-z]/g, '');
        if (s.includes('divine'))        return 'divine';
        if (s.includes('chaos'))         return 'chaos';
        if (s.includes('exalted'))       return 'exalted';
        if (s.includes('mirror'))        return 'mirror';
        if (s.includes('augmentation') || s === 'aug') return 'augmentation';
        if (s.includes('transmutation') || s === 'trans') return 'transmutation';
        if (s.includes('alteration')    || s === 'alt')  return 'alteration';
        if (s.includes('regal'))         return 'regal';
        if (s.includes('wisdom')        || s === 'wis')  return 'wisdom';
        if (s.includes('chance'))        return 'chance';
        if (s.includes('blessed'))       return 'blessed';
        if (s.includes('jeweller')      || s === 'jew')  return 'jewellers';
        if (s.includes('gemcutter')     || s === 'gcp')  return 'gemcutters';
        if (s.includes('scouring')      || s === 'scour') return 'scouring';
        if (s.includes('chromatic')     || s === 'chrom') return 'chromatic';
        if (s.includes('annulment') || s.includes('annul')) return 'annulment';
        if (s.includes('vaal'))          return 'vaal';
        if (s.includes('ancient'))       return 'ancient';
        if (s.includes('lesser'))        return 'lesser';
        if (s.includes('greater'))       return 'greater';
        if (s.includes('perfect'))       return 'perfect';
        if (s.includes('alch'))          return 'alch';
        if (s.includes('fusing'))        return 'fusing';
        if (s.includes('gold'))          return 'gold';
        return null;
      };

      // 1. Try to extract from the trade site's structured price element
      const priceEl = row.querySelector('.price') || row.querySelector('[class*="price"]') || row.querySelector('[class*="Price"]');
      if (priceEl) {
        const sprite = priceEl.querySelector('.currency-sprite') || priceEl.querySelector('[class*="currency"]') || priceEl.querySelector('span[title],img[title]');
        let currency = 'unknown';
        if (sprite) {
          // Try title attribute first
          const title = sprite.getAttribute('title') || '';
          const mapped = _mapCurrency(title);
          if (mapped) currency = mapped;

          // Then try CSS class names
          if (currency === 'unknown') {
            for (const cls of sprite.classList) {
              const m2 = _mapCurrency(cls);
              if (m2) { currency = m2; break; }
            }
          }
        }

        const amountText = priceEl.textContent?.replace(/[~]/g, '').trim() || '';
        const amountMatch = amountText.match(/(\d+(?:\.\d+)?)/);
        if (amountMatch && currency !== 'unknown') {
          return { amount: parseFloat(amountMatch[1]), currency };
        }
      }

      // 2. Fallback: match shorthand text like "1 aug", "2 chaos", "1 divine"
      const txt = row.innerText || '';
      const shorthand = txt.match(/(\d+(?:[.,]\d+)?)\s*(divine|exalted|chaos|mirror|vaal|regal|blessed|scouring|scour|chromatic|chrom|annulment|annul|ancient|lesser|greater|perfect|augmentation|aug|transmutation|trans|alteration|alt|fusing|alch|chance|wisdom|wis|jeweller(?:'?s)?|gemcutter(?:'?s)?|gcp|gold)/i);
      if (shorthand) {
        const mapped = _mapCurrency(shorthand[2]);
        if (mapped) return { amount: parseFloat(shorthand[1].replace(',', '.')), currency: mapped };
      }

      // 3. Fallback: match "NxFull Currency Name" patterns like "1xOrb of Augmentation"
      const fullName = txt.match(/(\d+)\s*[x×]\s*([A-Za-z ']+?)(?:\s*\||\s*Fee|\s*\n|$)/i);
      if (fullName) {
        const mapped = _mapCurrency(fullName[2]);
        if (mapped) return { amount: parseFloat(fullName[1]), currency: mapped };
      }

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
      return { lines: lines.slice(0, 30), rawText: lines.join(' | ').slice(0, 600) };
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
      if (/orb|shard|fragment|scarab|divine|chaos|exalted|mirror|gold|augmentation|transmutation|alteration|regal|wisdom|fusing|alch|chance|blessed|jeweller|gemcutter|scouring|chromatic|annulment/.test(txt)) return 'currency';
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
      // Always start closed on page load to avoid the open→close flash on refresh
      this.settings.sidebarOpen = false;
      this.purchases = await Storage.getPurchases();
      this.characters = await Storage.getCharacters();
      _lang          = this.settings.language || 'en';
      this.selectedClass = null;

      this._buildDOM();
      this._attachListeners();
      this._renderHistory();
      this._setupMutationObserver();

      // Close language dropdown when clicking outside
      document.addEventListener('click', (e) => {
        const path = e.composedPath();
        const dropdown = this.shadow.getElementById('poe2ph-lang-dropdown');
        if (dropdown && dropdown.classList.contains('poe2ph-dropdown-open')) {
          if (!path.includes(dropdown)) {
            dropdown.classList.remove('poe2ph-dropdown-open');
            const trigger = this.shadow.getElementById('poe2ph-lang-trigger');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
          }
        }
      });
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
      // Start with NO body transition to avoid flashing on load.
      document.body.style.setProperty('transition', 'none', 'important');

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

      // ── Flash prevention ──────────────────────────────────────
      // The CSS <link> loads asynchronously. Before it loads the panel has no
      // transform and is fully visible on screen. When the stylesheet arrives and
      // applies `transform: translateX(100%)`, the browser runs the CSS transition
      // and animates the panel sliding out — the visible flash.
      //
      // Fix: set inline styles immediately to hide the panel with no transition
      // (inline styles win over any stylesheet, even before CSS is parsed).
      // Once the stylesheet is ready, a double rAF ensures the browser paints one
      // clean hidden frame before transitions are re-enabled.
      const panelEl  = this.root.querySelector('#poe2ph-panel');
      const toggleEl = this.root.querySelector('#poe2ph-toggle');
      const hiddenTransform = pos === 'left' ? 'translateX(-100%)' : 'translateX(100%)';

      if (panelEl) {
        panelEl.style.transition = 'none';
        panelEl.style.transform  = hiddenTransform;
      }
      if (toggleEl) {
        toggleEl.style.transition = 'none';
      }

      let transitionsRestored = false;
      const restoreTransitions = () => {
        if (transitionsRestored) return;
        transitionsRestored = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (panelEl) {
              panelEl.style.transition = '';
              panelEl.style.transform  = '';
            }
            if (toggleEl) {
              toggleEl.style.transition = '';
            }
            document.body.style.setProperty(
              'transition',
              'margin-right 0.4s ease, margin-left 0.4s ease',
              'important'
            );
          });
        });
      };

      cssLink.addEventListener('load', restoreTransitions);
      // Safety fallback in case 'load' never fires (e.g. cached resource)
      setTimeout(restoreTransitions, 400);
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
              <div class="poe2ph-banner-text">${t('banner.text').replace('{version}', CURRENT_VERSION)}</div>
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
            <button class="poe2ph-tab" data-tab="trash">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
              ${t('tabs.trash')}
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
                  <button class="poe2ph-class-option" data-class="${key}" title="${t(`classes.${key}`)}" 
                    style="--cls-color:${value.color};--cls-accent:${value.accent}">
                    ${value.portrait
                      ? `<img class="poe2ph-class-portrait" src="${chrome.runtime.getURL(value.portrait)}" alt="">`
                      : `<span class="poe2ph-class-emoji-fb">${value.emoji}</span>`
                    }
                    <span class="poe2ph-class-name">${t(`classes.${key}`)}</span>
                  </button>
                `).join('')}
              </div>

              <div class="poe2ph-char-form-actions">
                <button class="poe2ph-btn poe2ph-btn-primary" id="poe2ph-char-save-btn">${t('charBar.createBtn')}</button>
                <button class="poe2ph-btn" id="poe2ph-char-cancel-btn">${t('charBar.cancelBtn')}</button>
              </div>
            </div>

            <div class="poe2ph-spend-summary poe2ph-hidden" id="poe2ph-spend-summary"></div>
            <div class="poe2ph-history-list" id="poe2ph-history-list"></div>
          </div>

          <!-- Tab: Trash -->
          <div class="poe2ph-tab-content" id="tab-trash">
            <div class="poe2ph-trash-bar">
              <button class="poe2ph-btn poe2ph-btn-danger" id="poe2ph-empty-trash-btn">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                ${t('trash.emptyBtn')}
              </button>
            </div>
            <div class="poe2ph-history-list" id="poe2ph-trash-list"></div>
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
        { code:'en', flagFile:'gb.png', name:'English',   engName:'English' },
        { code:'es', flagFile:'es.png', name:'Español',   engName:'Spanish' },
        { code:'pt', flagFile:'br.png', name:'Português', engName:'Portuguese' },
        { code:'de', flagFile:'de.png', name:'Deutsch',   engName:'German' },
        { code:'fr', flagFile:'fr.png', name:'Français',  engName:'French' },
        { code:'ru', flagFile:'ru.png', name:'Русский',   engName:'Russian' },
        { code:'ja', flagFile:'jp.png', name:'日本語',     engName:'Japanese' },
        { code:'ko', flagFile:'kr.png', name:'한국어',     engName:'Korean' },
      ];
      const pos = this.settings.panelPosition;
      const activeLang = langs.find(l => l.code === this.settings.language) || langs[0];

      return `
        <div class="poe2ph-settings-content">
 
          <!-- Language -->
          <div class="poe2ph-setting-card">
            <h3 class="poe2ph-setting-title">${t('settings.language')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.languageDesc')}</p>
            
            <div class="poe2ph-dropdown poe2ph-lang-dropdown" id="poe2ph-lang-dropdown">
              <button class="poe2ph-dropdown-trigger" id="poe2ph-lang-trigger" aria-haspopup="listbox" aria-expanded="false">
                <img class="poe2ph-dropdown-flag-img" src="${chrome.runtime.getURL('popup/flags/' + activeLang.flagFile)}" alt="">
                <span class="poe2ph-dropdown-trigger-name">${activeLang.name.toUpperCase()}</span>
                <svg class="poe2ph-dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div class="poe2ph-dropdown-menu" id="poe2ph-lang-menu">
                ${langs.map(l => `
                  <div class="poe2ph-dropdown-item${this.settings.language === l.code ? ' poe2ph-active' : ''}" data-lang="${l.code}">
                    <img class="poe2ph-dropdown-flag-img" src="${chrome.runtime.getURL('popup/flags/' + l.flagFile)}" alt="">
                    <span class="poe2ph-dropdown-item-name">${l.name.toUpperCase()}</span>
                    <span class="poe2ph-dropdown-item-sub">${l.engName}</span>
                  </div>
                `).join('')}
              </div>
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

          <!-- Default Purchase Mode -->
          <div class="poe2ph-setting-card">
            <h3 class="poe2ph-setting-title">${t('settings.defaultFavorite')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.defaultFavoriteDesc')}</p>
            <div class="poe2ph-position-btns">
              <button class="poe2ph-pos-btn${!this.settings.defaultFavorite ? ' poe2ph-active' : ''}" id="poe2ph-defmode-normal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${t('settings.normal')}
              </button>
              <button class="poe2ph-pos-btn${this.settings.defaultFavorite ? ' poe2ph-active' : ''}" id="poe2ph-defmode-favorite">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-right:4px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${t('settings.favorite')}
              </button>
            </div>
          </div>

          <!-- Export -->
          <div class="poe2ph-setting-card">
            <h3 class="poe2ph-setting-title">${t('settings.export')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.exportDesc')}</p>
            <button class="poe2ph-btn poe2ph-btn-primary" id="poe2ph-export-btn">${t('settings.exportBtn')}</button>
          </div>

          <!-- Clear History -->
          <div class="poe2ph-setting-card poe2ph-danger-card">
            <h3 class="poe2ph-setting-title poe2ph-danger-title">${t('settings.clearHistory')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.clearHistoryDesc')}</p>
            <button class="poe2ph-btn poe2ph-btn-danger" id="poe2ph-clear-btn">${t('settings.clearBtn')}</button>
          </div>

          <!-- Clear All Characters -->
          <div class="poe2ph-setting-card poe2ph-danger-card">
            <h3 class="poe2ph-setting-title poe2ph-danger-title">${t('settings.clearChars')}</h3>
            <p class="poe2ph-setting-desc">${t('settings.clearCharsDesc')}</p>
            <button class="poe2ph-btn poe2ph-btn-danger" id="poe2ph-clear-chars-btn">${t('settings.clearCharsBtn')}</button>
          </div>

          <div class="poe2ph-settings-footer">
            ${t('settings.version')} ${chrome.runtime.getManifest().version}
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

      $('poe2ph-empty-trash-btn')?.addEventListener('click', () => this._emptyTrash());

      this._attachSettingsListeners();
      this._attachCharacterListeners();
    }

    _attachSettingsListeners() {
      const $ = id => this.shadow.getElementById(id);
 
      // Language Dropdown
      const dropdown = $('poe2ph-lang-dropdown');
      const trigger = $('poe2ph-lang-trigger');
      if (trigger && dropdown) {
        trigger.addEventListener('click', (e) => {
          e.stopPropagation();
          const open = dropdown.classList.toggle('poe2ph-dropdown-open');
          trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
 
      this.shadow.querySelectorAll('.poe2ph-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const lang = item.dataset.lang;
          this._setLanguage(lang);
        });
      });
 
      // Panel position
      this.shadow.querySelectorAll('.poe2ph-pos-btn[data-position]').forEach(btn =>
        btn.addEventListener('click', () => this._setPosition(btn.dataset.position)));
      $('poe2ph-reset-pos')?.addEventListener('click', () => this._setPosition('right'));
 
      // Default purchase mode
      $('poe2ph-defmode-normal')?.addEventListener('click', () => this._setDefaultFavorite(false));
      $('poe2ph-defmode-favorite')?.addEventListener('click', () => this._setDefaultFavorite(true));

      // Export / Clear
      $('poe2ph-export-btn')?.addEventListener('click', () => this._exportHistory());
      $('poe2ph-clear-btn')?.addEventListener('click', () => this._clearHistory());
      $('poe2ph-clear-chars-btn')?.addEventListener('click', () => this._clearAllCharacters());
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

      if (name === 'history') {
        this._renderHistory();
      } else if (name === 'trash') {
        this._renderTrash();
      }
    }

    // ----------------------------------------------------------
    //  History Rendering
    // ----------------------------------------------------------

    _renderHistory() {
      const list = this.shadow.getElementById('poe2ph-history-list');
      if (!list) return;

      const activeChar = this.settings.activeCharacterId || 'all';

      // Filter purchases (exclude soft-deleted ones)
      const filtered = this.purchases.filter(p => {
        if (p.deleted) return false;
        if (activeChar === 'all') return true;
        if (activeChar === 'none') return !p.characterId || p.characterId === 'none';
        return p.characterId === activeChar;
      });

      // ── Spending summary ────────────────────────────────────
      const summaryEl = this.shadow.getElementById('poe2ph-spend-summary');
      if (summaryEl) {
        const totals = {};
        for (const p of filtered) {
          if (p.price && p.price.amount > 0 && p.price.currency && p.price.currency !== 'unknown') {
            totals[p.price.currency] = (totals[p.price.currency] || 0) + p.price.amount;
          }
        }
        const entries = Object.entries(totals);
        const spentText = t('settings.version') === 'Version' ? 'Spent' : 'Gastado';

        // Always show character header when a specific character is selected
        if (activeChar !== 'all' && activeChar !== 'none') {
          const charObj = this.characters.find(c => c.id === activeChar);
          if (charObj) {
            const cInfo = CLASS_INFO[charObj.class] || null;

            const delBtnHTML = `
              <button class="poe2ph-char-delete-btn poe2ph-summary-delete-btn" data-id="${charObj.id}" title="Delete Character" style="align-self: center; height: 32px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2m-6 5v6m4-6v6"/>
                </svg>
              </button>
            `;

            // Build spending badges (may be empty)
            let badgesHTML = '';
            if (entries.length > 0) {
              const TIER = ['mirror','divine','exalted','chaos','regal','augmentation','transmutation',
                            'alteration','annulment','vaal','alch','chance','blessed','scouring',
                            'chromatic','fusing','jewellers','gemcutters','wisdom','gold'];
              entries.sort((a, b) => {
                const ai = TIER.indexOf(a[0]), bi = TIER.indexOf(b[0]);
                if (ai !== -1 && bi !== -1) return ai - bi;
                if (ai !== -1) return -1;
                if (bi !== -1) return 1;
                return b[1] - a[1];
              });
              badgesHTML = entries.map(([currency, amount]) => {
                const display = CURRENCY_DISPLAY[currency] || currency;
                const fmt = Number.isInteger(amount) ? amount : parseFloat(amount.toFixed(2));
                const tier = ['mirror','divine','exalted'].includes(currency) ? 'gold'
                           : currency === 'chaos' ? 'chaos' : 'normal';
                return `<span class="poe2ph-spend-badge poe2ph-spend-badge-${tier}">${fmt} ${display}</span>`;
              }).join('');
            }

            if (cInfo && cInfo.portrait) {
              summaryEl.innerHTML = `
                <div class="poe2ph-card-main" style="padding:0; background:transparent; border:none; box-shadow:none;">
                  <div class="poe2ph-card-img-container" style="width:48px; height:48px; border-radius:4px;">
                    <img class="poe2ph-card-img" style="object-fit:cover; object-position:top;" src="${chrome.runtime.getURL(cInfo.portrait)}" alt="">
                  </div>
                  <div class="poe2ph-card-info" style="display:flex; flex-direction:column; gap:6px; justify-content:center;">
                    <div style="display:flex; align-items:baseline; gap:6px;">
                      <span class="poe2ph-card-name" style="font-size:15px; letter-spacing:0.5px;">${charObj.name}</span>
                      ${badgesHTML ? `<span class="poe2ph-spend-label" style="font-size:10px;">– ${spentText}</span>` : ''}
                    </div>
                    ${badgesHTML ? `<div class="poe2ph-spend-badges" style="margin:0;">${badgesHTML}</div>` : ''}
                  </div>
                  ${delBtnHTML}
                </div>
              `;
            } else {
              const emoji = cInfo?.emoji || '👤';
              summaryEl.innerHTML = `
                <div class="poe2ph-spend-char-header">
                  <div class="poe2ph-spend-label">${emoji} ${charObj.name}${badgesHTML ? ` – ${spentText}` : ''}</div>
                  ${delBtnHTML}
                </div>
                ${badgesHTML ? `<div class="poe2ph-spend-badges">${badgesHTML}</div>` : ''}
              `;
            }

            const sumDelBtn = summaryEl.querySelector('.poe2ph-summary-delete-btn');
            if (sumDelBtn) {
              sumDelBtn.addEventListener('click', () => {
                this._deleteCharacter(sumDelBtn.dataset.id);
              });
            }
            summaryEl.classList.remove('poe2ph-hidden');
          } else {
            summaryEl.classList.add('poe2ph-hidden');
          }
        } else if (activeChar === 'all' && entries.length > 0) {
          // Sort: premier currencies first, then by amount
          const TIER = ['mirror','divine','exalted','chaos','regal','augmentation','transmutation',
                        'alteration','annulment','vaal','alch','chance','blessed','scouring',
                        'chromatic','fusing','jewellers','gemcutters','wisdom','gold'];
          entries.sort((a, b) => {
            const ai = TIER.indexOf(a[0]), bi = TIER.indexOf(b[0]);
            if (ai !== -1 && bi !== -1) return ai - bi;
            if (ai !== -1) return -1;
            if (bi !== -1) return 1;
            return b[1] - a[1];
          });
          const badges = entries.map(([currency, amount]) => {
            const display = CURRENCY_DISPLAY[currency] || currency;
            const fmt = Number.isInteger(amount) ? amount : parseFloat(amount.toFixed(2));
            const tier = ['mirror','divine','exalted'].includes(currency) ? 'gold'
                       : currency === 'chaos' ? 'chaos' : 'normal';
            return `<span class="poe2ph-spend-badge poe2ph-spend-badge-${tier}">${fmt} ${display}</span>`;
          }).join('');
          summaryEl.innerHTML = `
            <div class="poe2ph-spend-label" style="margin-bottom:8px;">📊 Total</div>
            <div class="poe2ph-spend-badges">${badges}</div>
          `;
          summaryEl.classList.remove('poe2ph-hidden');
        } else {
          summaryEl.classList.add('poe2ph-hidden');
        }
      }
      // ────────────────────────────────────────────────────────

      if (!filtered.length) {
        list.innerHTML = `
          <div class="poe2ph-empty">
            ${CHEST_SVG(52, 52)}
            <p class="poe2ph-empty-text">${t('history.empty')}</p>
            <p class="poe2ph-empty-hint">${t('history.emptyHint')}</p>
          </div>`;
        return;
      }

      // Sort: favorites first (both groups maintain date order as already in the array)
      const favorites    = filtered.filter(p => p.favorite);
      const nonFavorites = filtered.filter(p => !p.favorite);

      // Build HTML with optional section headers
      let html = '';
      if (favorites.length > 0) {
        html += `<div class="poe2ph-section-header">
          <span class="poe2ph-section-icon">⭐</span>
          <span class="poe2ph-section-title">${t('history.sectionFavorites')}</span>
        </div>`;
        html += favorites.map(p => this._cardHTML(p)).join('');
      }
      if (nonFavorites.length > 0 && favorites.length > 0) {
        html += `<div class="poe2ph-section-header poe2ph-section-header-items">
          <span class="poe2ph-section-title">${t('history.sectionItems')}</span>
        </div>`;
      }
      html += nonFavorites.map(p => this._cardHTML(p)).join('');

      list.innerHTML = html;

      // Attach card listeners
      list.querySelectorAll('.poe2ph-card').forEach(card => {
        const expandBtn = card.querySelector('.poe2ph-expand-btn');
        expandBtn?.addEventListener('click', e => {
          e.stopPropagation();
          card.classList.toggle('poe2ph-card-expanded');
        });
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

      // Favorite star buttons
      list.querySelectorAll('.poe2ph-fav-btn').forEach(btn => {
        btn.addEventListener('click', async e => {
          e.stopPropagation();
          const id = btn.dataset.id;
          const isFav = await Storage.toggleFavorite(id);
          // Update in-memory
          const purchase = this.purchases.find(x => x.id === id);
          if (purchase) purchase.favorite = isFav;
          // Re-render to reorder list
          this._renderHistory();
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

      // ── Drag & Drop reordering for favorites ─────────────────
      if (favorites.length > 1) {
        this._setupFavoriteDragDrop(list, favorites);
      }
    }

    // ----------------------------------------------------------
    //  Drag & Drop for Favorites
    // ----------------------------------------------------------

    _setupFavoriteDragDrop(list, favorites) {
      const favIds = new Set(favorites.map(p => p.id));
      let dragSrcId = null;
      let dragOverCard = null;

      // CRITICAL: The list-level dragover must call preventDefault so that
      // drop events fire even when the cursor is over a child of a card.
      list.addEventListener('dragover', e => { e.preventDefault(); });

      list.querySelectorAll('.poe2ph-card').forEach(card => {
        if (!favIds.has(card.dataset.id)) return;

        card.setAttribute('draggable', 'true');
        card.classList.add('poe2ph-draggable');

        // Disable drag on images so the browser doesn't start an image drag
        card.querySelectorAll('img').forEach(img => img.setAttribute('draggable', 'false'));

        card.addEventListener('dragstart', e => {
          dragSrcId = card.dataset.id;
          // Store in dataTransfer as a fallback
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', dragSrcId);
          // Delay adding the class so the ghost image looks normal
          requestAnimationFrame(() => card.classList.add('poe2ph-dragging'));
        });

        card.addEventListener('dragend', () => {
          card.classList.remove('poe2ph-dragging');
          list.querySelectorAll('.poe2ph-drag-over').forEach(el => el.classList.remove('poe2ph-drag-over'));
          dragSrcId = null;
          dragOverCard = null;
        });

        // dragenter is more reliable than dragover for the highlight in Shadow DOM
        // because it fires once per element entry instead of continuously
        card.addEventListener('dragenter', e => {
          e.preventDefault(); // needed in some browsers
          const srcId = dragSrcId;
          if (!srcId || card.dataset.id === srcId) return;
          if (!favIds.has(card.dataset.id)) return;
          if (dragOverCard && dragOverCard !== card) {
            dragOverCard.classList.remove('poe2ph-drag-over');
          }
          dragOverCard = card;
          card.classList.add('poe2ph-drag-over');
        });

        // dragover must also call preventDefault to allow the drop
        card.addEventListener('dragover', e => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });

        card.addEventListener('drop', async e => {
          e.preventDefault();
          e.stopPropagation();
          // Read srcId from both closure and dataTransfer (fallback for Shadow DOM edge cases)
          const srcId = dragSrcId || e.dataTransfer.getData('text/plain');
          const targetId = card.dataset.id;

          // Clean up visual state immediately (before async work)
          card.classList.remove('poe2ph-drag-over');
          list.querySelectorAll('.poe2ph-drag-over').forEach(el => el.classList.remove('poe2ph-drag-over'));
          dragSrcId = null;
          dragOverCard = null;

          if (!srcId || srcId === targetId) return;
          if (!favIds.has(targetId)) return;

          // Read fresh from storage, reorder, and save
          const allPurchases = await Storage.getPurchases();
          const srcIdx = allPurchases.findIndex(p => p.id === srcId);
          if (srcIdx === -1) return;
          const [srcItem] = allPurchases.splice(srcIdx, 1);
          const newTgtIdx = allPurchases.findIndex(p => p.id === targetId);
          if (newTgtIdx === -1) { allPurchases.splice(srcIdx, 0, srcItem); return; }
          allPurchases.splice(newTgtIdx, 0, srcItem);

          await Storage.setPurchases(allPurchases);
          this.purchases = allPurchases;
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
            <div class="poe2ph-card-actions">
              <button class="poe2ph-expand-btn" title="Expand/Collapse">
                <svg class="poe2ph-expand-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <button class="poe2ph-fav-btn${p.favorite ? ' poe2ph-fav-active' : ''}" data-id="${p.id}" title="Favorite">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="${p.favorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
              <button class="poe2ph-delete-btn" data-id="${p.id}" title="${t('history.delete')}">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="poe2ph-card-details-wrapper">
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

              ${(p.stats?.lines?.length || p.stats?.rawText) ? `
              <div class="poe2ph-detail-row poe2ph-detail-row--stats">
                <span class="poe2ph-detail-label">Stats</span>
                <div class="poe2ph-stats-lines">
                  ${(() => {
                    const isTier = s => /^[PS]\d+(\s*\+\s*[PS]\d+)*$/i.test(s.trim());
                    const rawLines = p.stats.lines || p.stats.rawText.split(' | ');
                    const out = [];
                    let i = 0;
                    while (i < rawLines.length) {
                      const cur = rawLines[i];
                      const next = rawLines[i + 1];
                      if (isTier(cur) && next && !isTier(next)) {
                        // tier BEFORE stat
                        out.push(`<div class="poe2ph-stat-line poe2ph-stat-line--tiered"><span class="poe2ph-tier-badge">${this._esc(cur.trim())}</span><span class="poe2ph-stat-text">${this._esc(next)}</span></div>`);
                        i += 2;
                      } else if (!isTier(cur) && next && isTier(next)) {
                        // tier AFTER stat
                        out.push(`<div class="poe2ph-stat-line poe2ph-stat-line--tiered"><span class="poe2ph-tier-badge">${this._esc(next.trim())}</span><span class="poe2ph-stat-text">${this._esc(cur)}</span></div>`);
                        i += 2;
                      } else {
                        out.push(`<div class="poe2ph-stat-line">${this._esc(cur)}</div>`);
                        i++;
                      }
                    }
                    return out.join('');
                  })()}
                </div>
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
          </div>
        </div>`;
    }

    _renderTrash() {
      const list = this.shadow.getElementById('poe2ph-trash-list');
      if (!list) return;

      const deletedPurchases = this.purchases.filter(p => p.deleted === true);

      if (!deletedPurchases.length) {
        list.innerHTML = `
          <div class="poe2ph-empty">
            ${CHEST_SVG(52, 52)}
            <p class="poe2ph-empty-text">${t('trash.empty')}</p>
            <p class="poe2ph-empty-hint">${t('trash.emptyHint')}</p>
          </div>`;
        const emptyBtn = this.shadow.getElementById('poe2ph-empty-trash-btn');
        if (emptyBtn) emptyBtn.style.display = 'none';
        return;
      }

      const emptyBtn = this.shadow.getElementById('poe2ph-empty-trash-btn');
      if (emptyBtn) emptyBtn.style.display = 'flex';

      list.innerHTML = deletedPurchases.map(p => this._trashCardHTML(p)).join('');

      // Attach card listeners
      list.querySelectorAll('.poe2ph-card').forEach(card => {
        const expandBtn = card.querySelector('.poe2ph-expand-btn');
        expandBtn?.addEventListener('click', e => {
          e.stopPropagation();
          card.classList.toggle('poe2ph-card-expanded');
        });
      });
      list.querySelectorAll('.poe2ph-restore-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this._restorePurchase(btn.dataset.id);
        });
      });
      list.querySelectorAll('.poe2ph-delete-perm-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          this._deletePurchasePermanently(btn.dataset.id);
        });
      });
      list.querySelectorAll('.poe2ph-open-search').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          window.open(btn.dataset.url, '_blank');
        });
      });
    }

    _trashCardHTML(p) {
      const date  = new Date(p.timestamp);
      const ds    = date.toLocaleDateString();
      const ts    = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const icon  = CATEGORY_ICONS[p.category] || '📦';
      const cname = t(`categories.${p.category}`) || p.category;
      const curr  = CURRENCY_DISPLAY[p.price?.currency] || p.price?.currency || '?';

      const char = this.characters.find(c => c.id === p.characterId);
      const charText = char ? `${CLASS_INFO[char.class]?.emoji || '👤'} ${char.name}` : '';

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
            <div class="poe2ph-card-actions">
              <button class="poe2ph-expand-btn" title="Expand/Collapse">
                <svg class="poe2ph-expand-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              <div class="poe2ph-trash-actions">
                <button class="poe2ph-restore-btn" data-id="${p.id}" title="${t('history.restore')}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                </button>
                <button class="poe2ph-delete-perm-btn" data-id="${p.id}" title="${t('history.deletePermanent')}">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="poe2ph-card-details-wrapper">
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
              ${(p.stats?.lines?.length || p.stats?.rawText) ? `
              <div class="poe2ph-detail-row poe2ph-detail-row--stats">
                <span class="poe2ph-detail-label">Stats</span>
                <div class="poe2ph-stats-lines">
                  ${(p.stats.lines || p.stats.rawText.split(' | ')).map(l => `<div class="poe2ph-stat-line">${this._esc(l)}</div>`).join('')}
                </div>
              </div>` : ''}
              ${p.searchUrl ? `
              <div class="poe2ph-detail-row">
                <span class="poe2ph-detail-label">${t('history.searchUrl')}</span>
                <button class="poe2ph-open-search poe2ph-link-btn" data-url="${this._esc(p.searchUrl)}">
                  🔗 ${t('history.openSearch')}
                </button>
              </div>` : ''}
              ${p.notes ? `
              <div class="poe2ph-detail-row" style="margin-top: 4px;">
                <span class="poe2ph-detail-label">Notes</span>
                <span class="poe2ph-detail-value" style="font-style: italic;">${this._esc(p.notes)}</span>
              </div>` : ''}
            </div>
          </div>
        </div>`;
    }

    // ----------------------------------------------------------
    //  Actions
    // ----------------------------------------------------------

    async _deleteCharacter(id) {
      const charObj = this.characters.find(c => c.id === id);
      if (!charObj) return;
      const msg = _lang === 'es' ? `¿Seguro que quieres borrar a ${charObj.name}? Sus items quedarán "Sin Personaje".` : `Are you sure you want to delete ${charObj.name}? Their items will become "No Character".`;
      if (!confirm(msg)) return;

      this.characters = this.characters.filter(c => c.id !== id);
      await Storage.setCharacters(this.characters);

      const allPurchases = await Storage.getPurchases();
      let changed = false;
      allPurchases.forEach(p => {
        if (p.characterId === id) {
          p.characterId = 'none';
          changed = true;
        }
      });
      if (changed) {
        await Storage.setPurchases(allPurchases);
        this.purchases.forEach(p => {
          if (p.characterId === id) p.characterId = 'none';
        });
      }

      this.settings.activeCharacterId = 'all';
      await Storage.saveSettings(this.settings);

      const wasOpen = this.isOpen;
      this.root.innerHTML = this._containerHTML();
      this._attachListeners();
      this._renderHistory();
      if (wasOpen) {
        this.shadow.getElementById('poe2ph-panel')?.classList.add('poe2ph-panel-open');
        this.shadow.getElementById('poe2ph-toggle')?.classList.add('poe2ph-toggle-open');
      }
    }

    async _deletePurchase(id) {
      await Storage.deletePurchase(id);
      const purchase = this.purchases.find(p => p.id === id);
      if (purchase) purchase.deleted = true;
      this._renderHistory();
      if (this.activeTab === 'trash') this._renderTrash();
      this._toast(t('toast.deleted'));
    }

    async _restorePurchase(id) {
      await Storage.restorePurchase(id);
      const purchase = this.purchases.find(p => p.id === id);
      if (purchase) purchase.deleted = false;
      this._renderHistory();
      if (this.activeTab === 'trash') this._renderTrash();
      this._toast(t('toast.restored'));
    }

    async _deletePurchasePermanently(id) {
      await Storage.deletePurchasePermanent(id);
      this.purchases = this.purchases.filter(p => p.id !== id);
      this._renderHistory();
      if (this.activeTab === 'trash') this._renderTrash();
      this._toast(_lang === 'es' ? 'Compra eliminada definitivamente.' : 'Purchase permanently deleted.');
    }

    async _emptyTrash() {
      if (!confirm(t('trash.emptyConfirm'))) return;
      await Storage.clearTrash();
      this.purchases = this.purchases.filter(p => !p.deleted);
      this._renderHistory();
      if (this.activeTab === 'trash') this._renderTrash();
      this._toast(t('toast.trashCleared'));
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

    async _clearAllCharacters() {
      if (!this.characters.length) return;
      if (!confirm(t('settings.clearCharsConfirm'))) return;

      this.characters = [];
      await Storage.setCharacters([]);

      // Unassign all purchases from characters
      const allPurchases = await Storage.getPurchases();
      let changed = false;
      allPurchases.forEach(p => {
        if (p.characterId && p.characterId !== 'none') {
          p.characterId = 'none';
          changed = true;
        }
      });
      if (changed) {
        await Storage.setPurchases(allPurchases);
        this.purchases.forEach(p => { if (p.characterId !== 'none') p.characterId = 'none'; });
      }

      this.settings.activeCharacterId = 'all';
      await Storage.saveSettings(this.settings);

      const wasOpen = this.isOpen;
      this.root.innerHTML = this._containerHTML();
      this._attachListeners();
      this._renderHistory();
      if (wasOpen) {
        this.shadow.getElementById('poe2ph-panel')?.classList.add('poe2ph-panel-open');
        this._switchTab(this.activeTab);
      }
      this._toast(t('settings.clearChars'));
    }

    // ----------------------------------------------------------
    //  Record Purchase (called from MutationObserver)
    // ----------------------------------------------------------

    async recordPurchase(btn) {
      const item = Extractor.extract(btn);

      // Assign currently active character ID (default to 'none' if showing 'all' or 'none')
      const activeChar = this.settings.activeCharacterId || 'all';
      item.characterId = (activeChar === 'all' || activeChar === 'none') ? 'none' : activeChar;

      // Apply default favorite mode from settings
      item.favorite = this.settings.defaultFavorite === true;

      await Storage.addPurchase(item);
      this.purchases.unshift(item);
      this._renderHistory();
      this._toast(t('toast.purchased'));

      // Auto-open panel and switch to history
      if (!this.isOpen) this._toggle();
      this._switchTab('history');
    }

    async _setDefaultFavorite(val) {
      this.settings.defaultFavorite = val;
      await Storage.saveSettings(this.settings);
      // Update button active states without full rebuild
      const normalBtn = this.shadow.getElementById('poe2ph-defmode-normal');
      const favBtn    = this.shadow.getElementById('poe2ph-defmode-favorite');
      if (normalBtn) normalBtn.classList.toggle('poe2ph-active', !val);
      if (favBtn)    favBtn.classList.toggle('poe2ph-active', val);
    }

    // ----------------------------------------------------------
    //  MutationObserver — detect "Travel to Hideout" buttons
    // ----------------------------------------------------------

    _setupMutationObserver() {
      // Normalize button text for comparison (trim + collapse whitespace)
      const normalizeText = (str) => (str || '').replace(/\s+/g, ' ').trim();

      // Keywords that appear in all language variants of "Travel to Hideout"
      const TRAVEL_KEYWORDS = [
        'hideout',       // EN
        'escondite',     // ES (Viajar al Escondite)
        'guarida',       // ES (Viajar a la guarida)
        'esconderijo',   // PT
        'versteck',      // DE
        'unterschlupf',  // DE alt
        'cachette',      // FR
        '\u0443\u0431\u0435\u0436\u0438\u0449\u0435',       // RU (убежище)
        '\u30cf\u30a4\u30c9\u30a2\u30a6\u30c8',     // JA (ハイドアウト)
        '\uc740\uc2e0\ucc98',         // KO (은신처)
        '\u0e17\u0e35\u0e48\u0e0b\u0e48\u0e2d\u0e19',       // TH
        '\u85cf\u8eab',           // ZH-TW (藏身)
        '\u636e\u70b9',           // ZH-CN (据点)
      ];

      const isTravelButton = (el) => {
        // Must be an actual button element (or role="button") to avoid false positives
        // from sort/filter icons or other containers that might contain travel-related text.
        const isButtonEl = el.tagName === 'BUTTON' || el.getAttribute('role') === 'button';
        if (!isButtonEl) return false;

        // The PoE trade site always uses the class "direct-btn" on the Travel to Hideout button.
        // Requiring this class prevents any other button (e.g. sort arrows) from triggering a save.
        if (!el.classList.contains('direct-btn')) return false;

        const txt = normalizeText(el.textContent);
        if (!txt) return false;
        // 1. Exact match against known strings
        if (TRAVEL_TEXTS.has(txt)) return true;
        // 2. Partial keyword match (case-insensitive) as fallback for new language variants
        const lower = txt.toLowerCase();
        return TRAVEL_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
      };

      const watchNode = node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        // Check the node itself
        if (isTravelButton(node) && !node.__poe2ph) {
          this._trackButton(node);
        }

        // Check all descendants
        try {
          node.querySelectorAll('*').forEach(el => {
            if (isTravelButton(el) && !el.__poe2ph) {
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

      // Check for duplicate name (case-insensitive)
      const isDuplicate = this.characters.some(c => c.name.trim().toLowerCase() === name.toLowerCase());
      if (isDuplicate) {
        alert(t('charBar.duplicateName'));
        nameInp.focus();
        nameInp.select();
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
