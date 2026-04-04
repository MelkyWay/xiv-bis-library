import { CATEGORY_ORDER } from "../config/orders";
import type { Category } from "../types/bis";

function buildCategoryLabels(
  overrides: Partial<Record<Category, string>> = {}
): Record<Category, string> {
  const defaults = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, category])
  ) as Record<Category, string>;
  return {
    ...defaults,
    ...overrides
  };
}
export const messages = {
  en: {
    app: {
      title: "XIV BiS Library",
      subtitle:
        "Centralized links to community best-in-slots gear sets by job, role, and type of content.",
      lastUpdated: "Last updated: {date}",
      notAvailable: "-",
      loading: "Loading BiS data...",
      themeSwitch: "Switch to {theme} theme",
      validationWarnings: "Validation warnings",
      discordButton: "Join Discord",
      contributeButton: "Contribute"
    },
    common: {
      all: "All",
      light: "light",
      dark: "dark",
      locale: "Language",
      discord: "Discord",
      github: "GitHub",
      contribute: "Contribute",
      communityLinks: "Community links"
    },
    filters: {
      job: "Job",
      category: "Category",
      role: "Role",
      search: "Search",
      searchPlaceholder: "Job, tier, source...",
      reset: "Reset filters",
      favorites: "Favorites",
      secondaryTypeUltimate: "Ultimate",
      secondaryTypeCriterion: "Criterion",
      secondaryTypeUnreal: "Unreal",
      secondaryAriaCurrent: "{type} filter, current value: {value}",
      secondaryAriaOptions: "{type} options",
      roles: {
        Tank: "Tank",
        Healer: "Healer",
        Melee: "Melee",
        "Physical Ranged": "Physical Ranged",
        "Magical Ranged": "Magical Ranged",
        Limited: "Limited"
      },
      roleGroups: {
        Tank: "Tanks",
        Healer: "Healers",
        Melee: "Melee",
        "Physical Ranged": "Physical Ranged",
        "Magical Ranged": "Magical Ranged",
        Limited: "Limited"
      },
      categories: buildCategoryLabels()
    },
    table: {
      job: "Job",
      role: "Role",
      category: "Category",
      info: "Info",
      encounter: "Encounter",
      tier: "Tier",
      patch: "Patch",
      notes: "Notes",
      damage: "Damage",
      link: "Link",
      source: "Source",
      actionsAria: "Actions",
      favoriteAdd: "Favorite",
      favoriteRemove: "Unfavorite",
      noMatchingEntries: "No matching entries.",
      sortLabel: "{label} sort ({current}). Activate for {next}.",
      sortCurrent: {
        none: "none",
        asc: "ascending",
        desc: "descending"
      },
      sortNext: {
        asc: "ascending",
        desc: "descending"
      },
      copyLink: "Copy link",
      damageTypeSim: "Level 100 sim",
      damageTypePotency: "dmg/100 potency",
      simUpdated: "Last updated: {date}",
      pagination: {
        showing: "Showing {from}-{to} of {total}",
        page: "Page {current} / {total}",
        first: "First",
        prev: "Prev",
        next: "Next",
        last: "Last",
        firstAria: "First page",
        prevAria: "Previous page",
        nextAria: "Next page",
        lastAria: "Last page"
      }
    }
  },
  fr: {
    app: {
      title: "FFXIV BiS Library",
      subtitle:
        "Liens centralisés vers les sets BiS de la communauté par job, rôle et type de contenu.",
      lastUpdated: "Dernière mise à jour : {date}",
      notAvailable: "-",
      loading: "Chargement des données BiS...",
      themeSwitch: "Passer au thème {theme}",
      validationWarnings: "Avertissements de validation"
    },
    common: {
      all: "Tous",
      light: "clair",
      dark: "sombre",
      locale: "Langue"
    },
    filters: {
      job: "Job",
      category: "Catégorie",
      role: "Rôle",
      search: "Recherche",
      searchPlaceholder: "Job, palier, source...",
      reset: "Réinitialiser les filtres",
      favorites: "Favoris",
      secondaryTypeUltimate: "Ultimate",
      secondaryTypeCriterion: "Criterion",
      secondaryTypeUnreal: "Unreal",
      secondaryAriaCurrent: "Filtre {type}, valeur actuelle : {value}",
      secondaryAriaOptions: "Options {type}",
      roles: {
        Tank: "Tank",
        Healer: "Soigneur",
        Melee: "Mêlée",
        "Physical Ranged": "Distance physique",
        "Magical Ranged": "Distance magique",
        Limited: "Limité"
      },
      roleGroups: {
        Tank: "Tanks",
        Healer: "Soigneurs",
        Melee: "Mêlée",
        "Physical Ranged": "Distance physique",
        "Magical Ranged": "Distance magique",
        Limited: "Limité"
      },
      categories: buildCategoryLabels({
        Savage: "Sadique",
        Ultimate: "Fatal",
        Prog: "Progression",
        Criterion: "Critérium",
        Unreal: "Irréel",
        "Occult Crescent": "�Zle de Lunule",
        Other: "Autre"
      })
    },
    table: {
      job: "Job",
      role: "Rôle",
      category: "Catégorie",
      info: "Info",
      encounter: "Combat",
      tier: "Tier",
      patch: "Patch",
      notes: "Notes",
      damage: "DPS Sim",
      link: "Lien",
      source: "Source",
      actionsAria: "Actions",
      favoriteAdd: "Ajouter aux favoris",
      favoriteRemove: "Retirer des favoris",
      noMatchingEntries: "Aucune entrée correspondante.",
      sortLabel: "Tri {label} ({current}). Activer pour {next}.",
      sortCurrent: {
        none: "aucun",
        asc: "croissant",
        desc: "décroissant"
      },
      sortNext: {
        asc: "croissant",
        desc: "décroissant"
      },
      copyLink: "Copier le lien",
      simUpdated: "Dernière mise à jour : {date}",
      pagination: {
        showing: "Affichage {from}-{to} sur {total}",
        page: "Page {current} / {total}",
        first: "Début",
        prev: "Préc",
        next: "Suiv",
        last: "Fin",
        firstAria: "Première page",
        prevAria: "Page précédente",
        nextAria: "Page suivante",
        lastAria: "Dernière page"
      }
    }
  },
  de: {
    app: {
      title: "FFXIV BiS Library",
      subtitle: "Zentrale Links zu Community-BiS-Sets nach Job, Rolle und Inhaltstyp.",
      lastUpdated: "Zuletzt aktualisiert: {date}",
      notAvailable: "-",
      loading: "BiS-Daten werden geladen...",
      themeSwitch: "Zu {theme}-Theme wechseln",
      validationWarnings: "Validierungswarnungen"
    },
    common: {
      all: "Alle",
      light: "hellen",
      dark: "dunklen",
      locale: "Sprache"
    },
    filters: {
      job: "Job",
      category: "Kategorie",
      role: "Rolle",
      search: "Suche",
      searchPlaceholder: "Job, Tier, Quelle...",
      reset: "Filter zurücksetzen",
      favorites: "Favoriten",
      secondaryTypeUltimate: "Ultimate",
      secondaryTypeCriterion: "Criterion",
      secondaryTypeUnreal: "Unreal",
      secondaryAriaCurrent: "{type}-Filter, aktueller Wert: {value}",
      secondaryAriaOptions: "{type}-Optionen",
      roles: {
        Tank: "Tank",
        Healer: "Heiler",
        Melee: "Nahkampf",
        "Physical Ranged": "Physisch Fernkampf",
        "Magical Ranged": "Magisch Fernkampf",
        Limited: "Limitiert"
      },
      roleGroups: {
        Tank: "Tanks",
        Healer: "Heiler",
        Melee: "Nahkampf",
        "Physical Ranged": "Physisch Fernkampf",
        "Magical Ranged": "Magisch Fernkampf",
        Limited: "Limitiert"
      },
      categories: buildCategoryLabels({
        Savage: "Episch",
        Ultimate: "Fatal",
        Prog: "Progression",
        Criterion: "Kriterium",
        Unreal: "Unwirklich",
        "Occult Crescent": "Kreszentia",
        Other: "Sonstiges"
      })
    },
    table: {
      job: "Job",
      role: "Rolle",
      category: "Kategorie",
      info: "Info",
      encounter: "Begegnung",
      tier: "Tier",
      patch: "Patch",
      notes: "Notizen",
      damage: "Sim DPS",
      link: "Link",
      source: "Quelle",
      actionsAria: "Aktionen",
      favoriteAdd: "Zu Favoriten hinzufügen",
      favoriteRemove: "Aus Favoriten entfernen",
      noMatchingEntries: "Keine passenden Einträge.",
      sortLabel: "{label}-Sortierung ({current}). Aktivieren für {next}.",
      sortCurrent: {
        none: "keine",
        asc: "aufsteigend",
        desc: "absteigend"
      },
      sortNext: {
        asc: "aufsteigend",
        desc: "absteigend"
      },
      copyLink: "Link kopieren",
      simUpdated: "Zuletzt aktualisiert: {date}",
      pagination: {
        showing: "{from}-{to} von {total}",
        page: "Seite {current} / {total}",
        first: "Erste",
        prev: "Zurück",
        next: "Weiter",
        last: "Letzte",
        firstAria: "Erste Seite",
        prevAria: "Vorherige Seite",
        nextAria: "Nächste Seite",
        lastAria: "Letzte Seite"
      }
    }
  },
  ja: {
    app: {
      title: "FFXIV BiS Library",
      subtitle: "�,��f��f-�?��f��f��f��?��,��f��f?�f��f"種�^��"とに�,��fY�f��f<�f?�,�BiS�,��ff�f^への�f��f��,��,'�>?�"�?,",
      lastUpdated: "�o?�,�>��-�: {date}",
      notAvailable: "-",
      loading: "BiS�f?�f��,��,'読み込み中...",
      themeSwitch: "{theme}�f?�f��fzに�^?�,S�>��^",
      validationWarnings: "�o証警�'S"
    },
    common: {
      all: "�Tべて",
      light: "�f��,��f^",
      dark: "�f?�f��,�",
      locale: "�?�z"
    },
    filters: {
      job: "�,��f��f-",
      category: "�,��f?�,��f�",
      role: "�f��f��f�",
      search: "�o索",
      searchPlaceholder: "�,��f��f-�?�層�?��,��f��,�...",
      reset: "�f.�,��f��,��f��,'�f��,��ff�f^",
      favorites: "�S�-に�.��,S",
      secondaryTypeUltimate: "絶",
      secondaryTypeCriterion: "�.��z",
      secondaryTypeUnreal: "幻",
      secondaryAriaCurrent: "{type}�f.�,��f��,��f��?�現�o��?�: {value}",
      secondaryAriaOptions: "{type}の選�Sz�,�",
      roles: {
        Tank: "�,��f��,�",
        Healer: "�f'�f��f��f�",
        Melee: "�'�Z�",
        "Physical Ranged": "�?��?遠�s"",
        "Magical Ranged": "�"�.遠�s"",
        Limited: "�f��fY�f?�ff�f?"
      },
      roleGroups: {
        Tank: "�,��f��,�",
        Healer: "�f'�f��f��f�",
        Melee: "�'�Z�",
        "Physical Ranged": "�?��?遠�s"",
        "Magical Ranged": "�"�.遠�s"",
        Limited: "�f��fY�f?�ff�f?"
      },
      categories: buildCategoryLabels({
        Savage: "�>�式",
        Ultimate: "絶",
        Prog: "�"��.�",
        Criterion: "�.��z",
        Unreal: "幻�Z�.�^�",
        "Occult Crescent": "�of�-楼の島 �,��f��,��f��f^�,��,��f�",
        Other: "その�-"
      })
    },
    table: {
      job: "�,��f��f-",
      role: "�f��f��f�",
      category: "�,��f?�,��f�",
      info: "�f.報",
      encounter: "�,��f��f?�f��f"",
      tier: "Tier",
      patch: "Patch",
      notes: "�f��f�",
      damage: "Sim DPS",
      link: "�f��f��,�",
      source: "�,��f��,�",
      actionsAria: "�"��o",
      favoriteAdd: "�S�-に�.��,Sに追�S�",
      favoriteRemove: "�S�-に�.��,S解�T�",
      noMatchingEntries: "�?�?��T�,<�,��f��f^�f��O�,�,Sま�>�,"�?,",
      sortLabel: "{label}の並び�>��^�^{current}�?�?,{next}で並び�>��^�?,",
      sortCurrent: {
        none: "な�-",
        asc: "�~?�?",
        desc: "�T��?"
      },
      sortNext: {
        asc: "�~?�?",
        desc: "�T��?"
      },
      copyLink: "�f��f��,��,'�,��f"�f�",
      simUpdated: "�o?�,�>��-�: {date}",
      pagination: {
        showing: "{total}件中 {from}-{to}件�,'表示",
        page: "{current} / {total}�fs�f��,�",
        first: "�.^頭",
        prev: "�?�へ",
        next: "次へ",
        last: "�o�尾",
        firstAria: "�o?�^�の�fs�f��,�",
        prevAria: "�?�の�fs�f��,�",
        nextAria: "次の�fs�f��,�",
        lastAria: "�o?�Oの�fs�f��,�"
      }
    }
  },
  ko: {
    app: {
      title: "FFXIV BiS Library",
      subtitle: "직�-., �-��.�, �~�.�츠 �o��~.�" 커뮤�<^�<� BiS �"��S� 링크를 �.o곳�-� 모�.~�S��<^�<�.",
      lastUpdated: "�o�. �-.데이�S�: {date}",
      notAvailable: "-",
      loading: "BiS 데이�"�를 �^�Y��~��S" �'...",
      themeSwitch: "{theme} �.O�^�o �"�T~",
      validationWarnings: "�?증 경고"
    },
    common: {
      all: "�"체",
      light: "라이�S�",
      dark: "�<�크",
      locale: "�-��-�"
    },
    filters: {
      job: "직�-.",
      category: "카�.O고리",
      role: "�-��.�",
      search: "�?�f?",
      searchPlaceholder: "직�-., �<��-�, �o�~...",
      reset: "�."�"� �^기�T"",
      favorites: "즐겨찾기",
      secondaryTypeUltimate: "�-��<��<",
      secondaryTypeCriterion: "이문",
      secondaryTypeUnreal: "�T~ �?��O�"",
      secondaryAriaCurrent: "{type} �."�"�, �~"�z� �': {value}",
      secondaryAriaOptions: "{type} �~��.~",
      roles: {
        Tank: "방�-� �-��.�",
        Healer: "�sO복 �-��.�",
        Melee: "근거리 �"o�Y�",
        "Physical Ranged": "�>�거리 물리 공격",
        "Magical Ranged": "�>�거리 �^�. 공격",
        Limited: "미�."
      },
      roleGroups: {
        Tank: "방�-� �-��.�",
        Healer: "�sO복 �-��.�",
        Melee: "근거리 �"o�Y�",
        "Physical Ranged": "�>�거리 물리 공격",
        "Magical Ranged": "�>�거리 �^�. 공격",
        Limited: "미�."
      },
      categories: buildCategoryLabels({
        Savage: "�~��<�",
        Ultimate: "�-��<��< �^이�"o",
        Prog: "공�z�",
        Criterion: "이문",
        Unreal: "�T~ �?��O�"",
        "Occult Crescent": "�<��"�.o �^�S��<�",
        Other: "기�f?"
      })
    },
    table: {
      job: "직�-.",
      role: "�-��.�",
      category: "카�.O고리",
      info: "�.보",
      encounter: "�"�^�",
      tier: "�<��-�",
      patch: "Patch",
      notes: "�.��S�",
      damage: "Sim DPS",
      link: "링크",
      source: "�o�~",
      actionsAria: "�z'�-.",
      favoriteAdd: "즐겨찾기�-� �"�?",
      favoriteRemove: "즐겨찾기 �.��o",
      noMatchingEntries: "일�~�.~�S" �.�목이 �-?�S��<^�<�.",
      sortLabel: "{label} �.렬 ({current}). {next}(�o�)�o �"�T~.",
      sortCurrent: {
        none: "�-?�O",
        asc: "�~��"차�^o",
        desc: "�,�림차�^o"
      },
      sortNext: {
        asc: "�~��"차�^o",
        desc: "�,�림차�^o"
      },
      copyLink: "링크 복�,�",
      simUpdated: "�o�. �-.데이�S�: {date}",
      pagination: {
        showing: "{total}�o �' {from}-{to}�o �'o�<o",
        page: "{current} / {total}�Z~이�?",
        first: "�~�O",
        prev: "이�"",
        next: "�<��O",
        last: "�^�?�?",
        firstAria: "첫 �Z~이�?",
        prevAria: "이�" �Z~이�?",
        nextAria: "�<��O �Z~이�?",
        lastAria: "�^�?�? �Z~이�?"
      }
    }
  },
  "zh-CN": {
    app: {
      title: "XIV BiS �"�-T�"",
      subtitle: "�O?�O�s�?��O责�Z�?.容类�z<�>?中�.��?社�O� BiS �.��.�"��Z��?,",
      lastUpdated: "�o?�Z�>��-��s{date}",
      notAvailable: "-",
      loading: "正�o��S�载 BiS �.�据...",
      themeSwitch: "�^?换�^�{theme}主�~",
      validationWarnings: "校�O警�'S"
    },
    common: {
      all: "�.��f�",
      light: "�.�?�",
      dark: "深�?�",
      locale: "语�?"
    },
    filters: {
      job: "�O�s",
      category: "�^?类",
      role: "�O责",
      search: "�o索",
      searchPlaceholder: "�O�s�?��,级�?�来源...",
      reset: "�?�置�>�??",
      favorites: "�"��-�",
      secondaryTypeUltimate: "绝�f�^~",
      secondaryTypeCriterion: "�,�-�",
      secondaryTypeUnreal: "幻巧",
      secondaryAriaCurrent: "{type}�>�??�O�"�?��?��s{value}",
      secondaryAriaOptions: "{type}�??项",
      roles: {
        Tank: "坦�.<",
        Healer: "治�--",
        Melee: "�'�^~",
        "Physical Ranged": "�?��?�o�<",
        "Magical Ranged": "�"�.�o�<",
        Limited: "�T��s"
      },
      roleGroups: {
        Tank: "坦�.<",
        Healer: "治�--",
        Melee: "�'�^~",
        "Physical Ranged": "�?��?�o�<",
        "Magical Ranged": "�"�.�o�<",
        Limited: "�T��s"
      },
      categories: buildCategoryLabels({
        Savage: "�>�式",
        Ultimate: "绝�f�^~",
        Prog: "�?�'",
        Criterion: "�,�-��>�式",
        Unreal: "幻巧�^~",
        "Occult Crescent": "�s��o^�?T�Z�",
        Other: "�.��-"
      })
    },
    table: {
      job: "�O�s",
      role: "�O责",
      category: "�^?类",
      info: "信息",
      encounter: "�?��o�",
      tier: "�,级",
      patch: "Patch",
      notes: "�?注",
      damage: "模�<Y DPS",
      link: "�"��Z�",
      source: "来源",
      actionsAria: "�"��o",
      favoriteAdd: "�S��.��"��-�",
      favoriteRemove: "�-�^�"��-�",
      noMatchingEntries: "没�o?�O��.��s"条�>��?,",
      sortLabel: "{label}�Z'序�^{current}�?�?,�,��?��Z{next}�?,",
      sortCurrent: {
        none: "�-�",
        asc: "�?序",
        desc: "�T�序"
      },
      sortNext: {
        asc: "�?序",
        desc: "�T�序"
      },
      copyLink: "复�^��"��Z�",
      simUpdated: "�o?�Z�>��-��s{date}",
      pagination: {
        showing: "�~�示第 {from}-{to} 条�O�.� {total} 条",
        page: "第 {current} / {total} 页",
        first: "�-页",
        prev: "�S�?页",
        next: "�<�?页",
        last: "�o�页",
        firstAria: "第�?页",
        prevAria: "�S�?页",
        nextAria: "�<�?页",
        lastAria: "�o?�Z�?页"
      }
    }
  },
  "zh-TW": {
    app: {
      title: "XIV BiS �?�-T庫",
      subtitle: "�O?職業�?�職責�^?�.�容�z�z<�>?中�.��?社群 BiS �.�裝�?�結�?,",
      lastUpdated: "�o?�O�>��-��s{date}",
      notAvailable: "-",
      loading: "正�o��?�.� BiS �?�-T...",
      themeSwitch: "�^?�>�^�{theme}主�O",
      validationWarnings: "校�-警�'S"
    },
    common: {
      all: "�.��f�",
      light: "淺�?�",
      dark: "深�?�",
      locale: "�z�?"
    },
    filters: {
      job: "職業",
      category: "�^?�z",
      role: "職責",
      search: "�o�<",
      searchPlaceholder: "職業�?�層�s�?��?源...",
      reset: "�?�置篩選",
      favorites: "�"��-�",
      secondaryTypeUltimate: "�.�f�^�",
      secondaryTypeCriterion: "�.��z",
      secondaryTypeUnreal: "幻巧",
      secondaryAriaCurrent: "{type}篩選�O�.��?��?��s{value}",
      secondaryAriaOptions: "{type}選�.",
      roles: {
        Tank: "坦�.<",
        Healer: "治�T,",
        Melee: "�'�^�",
        "Physical Ranged": "�?��?遠�<",
        "Magical Ranged": "�"�.遠�<",
        Limited: "�T��s"
      },
      roleGroups: {
        Tank: "坦�.<",
        Healer: "治�T,",
        Melee: "�'�^�",
        "Physical Ranged": "�?��?遠�<",
        "Magical Ranged": "�"�.遠�<",
        Limited: "�T��s"
      },
      categories: buildCategoryLabels({
        Savage: "�>�式",
        Ultimate: "�.�f�^�",
        Prog: "�-<�'",
        Criterion: "�.��z�>�式",
        Unreal: "幻巧�^�",
        "Occult Crescent": "�s��o^�?T�'�",
        Other: "�.��-"
      })
    },
    table: {
      job: "職業",
      role: "職責",
      category: "�^?�z",
      info: "�?�S",
      encounter: "�?��o�",
      tier: "層�s",
      patch: "Patch",
      notes: "�,T註",
      damage: "模�"� DPS",
      link: "�?�結",
      source: "�?源",
      actionsAria: "�"��o",
      favoriteAdd: "�S��.��"��-�",
      favoriteRemove: "�-�^�"��-�",
      noMatchingEntries: "�'�o?�O��.��s"條�>��?,",
      sortLabel: "{label}�Z'序�^{current}�?�?,�z�"S�O{next}�?,",
      sortCurrent: {
        none: "�"�",
        asc: "�?序",
        desc: "�T�序"
      },
      sortNext: {
        asc: "�?序",
        desc: "�T�序"
      },
      copyLink: "�?製�?�結",
      simUpdated: "�o?�O�>��-��s{date}",
      pagination: {
        showing: "顯示第 {from}-{to} 條�O�.� {total} 條",
        page: "第 {current} / {total} 頁",
        first: "�-頁",
        prev: "�S�?頁",
        next: "�<�?頁",
        last: "�o�頁",
        firstAria: "第�?頁",
        prevAria: "�S�?頁",
        nextAria: "�<�?頁",
        lastAria: "�o?�O�?頁"
      }
    }
  }
};

