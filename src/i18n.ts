import { createI18n } from "vue-i18n";
import { CATEGORY_ORDER } from "./config/orders";
import type { Category } from "./types/bis";

export const SUPPORTED_LOCALES = ["en", "fr", "de", "ja", "ko", "zh"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: SupportedLocale = "en";
export const LOCALE_STORAGE_KEY = "locale";

function buildCategoryLabels(overrides: Partial<Record<Category, string>> = {}): Record<Category, string> {
  const defaults = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, category])) as Record<Category, string>;
  return {
    ...defaults,
    ...overrides
  };
}

const messages = {
  en: {
    app: {
      title: "XIV BiS Library",
      subtitle: "Centralized links to community best-in-slots gear sets by job, role, and type of content.",
      lastUpdated: "Last updated: {date}",
      notAvailable: "-",
      loading: "Loading BiS data...",
      themeSwitch: "Switch to {theme} theme",
      validationWarnings: "Validation warnings"
    },
    common: {
      all: "All",
      light: "light",
      dark: "dark",
      locale: "Language"
    },
    filters: {
      job: "Job",
      category: "Category",
      role: "Role",
      search: "Search",
      searchPlaceholder: "Job, tier, source...",
      reset: "Reset filters",
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
      notes: "Notes",
      damage: "Damage",
      link: "Link",
      source: "Source",
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
      title: "Bibliothèque BiS XIV",
      subtitle: "Liens centralisés vers les sets BiS de la communauté par job, rôle et type de contenu.",
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
      searchPlaceholder: "Job, tier, source...",
      reset: "Réinitialiser les filtres",
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
        "Occult Crescent": "Île de Lunule",
        Eureka: "Eureka",
        Other: "Autre"
      })
    },
    table: {
      job: "Job",
      role: "Rôle",
      category: "Catégorie",
      info: "Info",
      encounter: "Rencontre",
      tier: "Tier",
      notes: "Notes",
      damage: "DPS Sim",
      link: "Lien",
      source: "Source",
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
      title: "XIV BiS Bibliothek",
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
      reset: "Filter zurucksetzen",
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
        Eureka: "Eureka",
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
      notes: "Notizen",
      damage: "Sim DPS",
      link: "Link",
      source: "Quelle",
      noMatchingEntries: "Keine passenden Eintrage.",
      sortLabel: "{label}-Sortierung ({current}). Aktivieren fur {next}.",
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
        prev: "Zuruck",
        next: "Weiter",
        last: "Letzte",
        firstAria: "Erste Seite",
        prevAria: "Vorherige Seite",
        nextAria: "Nachste Seite",
        lastAria: "Letzte Seite"
      }
    }
  },
  ja: {
    app: {
      title: "XIV BiS ライブラリ",
      subtitle: "ジョブ、ロール、コンテンツ種別ごとにコミュニティBiSセットへのリンクを集約。",
      lastUpdated: "最終更新: {date}",
      notAvailable: "-",
      loading: "BiSデータを読み込み中...",
      themeSwitch: "{theme}テーマに切り替え",
      validationWarnings: "検証警告"
    },
    common: {
      all: "すべて",
      light: "ライト",
      dark: "ダーク",
      locale: "言語"
    },
    filters: {
      job: "ジョブ",
      category: "カテゴリ",
      role: "ロール",
      search: "検索",
      searchPlaceholder: "ジョブ、Tier、ソース...",
      reset: "フィルターをリセット",
      secondaryTypeUltimate: "絶",
      secondaryTypeCriterion: "異聞",
      secondaryTypeUnreal: "幻",
      secondaryAriaCurrent: "{type}フィルター、現在値: {value}",
      secondaryAriaOptions: "{type}の選択肢",
      roles: {
        Tank: "タンク",
        Healer: "ヒーラー",
        Melee: "近接",
        "Physical Ranged": "物理遠隔",
        "Magical Ranged": "魔法遠隔",
        Limited: "リミテッド"
      },
      roleGroups: {
        Tank: "タンク",
        Healer: "ヒーラー",
        Melee: "近接",
        "Physical Ranged": "物理遠隔",
        "Magical Ranged": "魔法遠隔",
        Limited: "リミテッド"
      },
      categories: buildCategoryLabels({
        Savage: "零式",
        Ultimate: "絶",
        Prog: "攻略",
        Criterion: "異聞",
        Unreal: "幻討滅戦",
        "Occult Crescent": "蜃気楼の島 クレセントアイル",
        Eureka: "禁断の地 エウレカ",
        Other: "その他"
      })
    },
    table: {
      job: "ジョブ",
      role: "ロール",
      category: "カテゴリ",
      info: "情報",
      encounter: "コンテンツ",
      tier: "Tier",
      notes: "メモ",
      damage: "Sim DPS",
      link: "リンク",
      source: "ソース",
      noMatchingEntries: "一致するエントリがありません。",
      sortLabel: "{label}の並び替え（{current}）。{next}で並び替え。",
      sortCurrent: {
        none: "なし",
        asc: "昇順",
        desc: "降順"
      },
      sortNext: {
        asc: "昇順",
        desc: "降順"
      },
      copyLink: "リンクをコピー",
      simUpdated: "最終更新: {date}",
      pagination: {
        showing: "{total}件中 {from}-{to}件を表示",
        page: "{current} / {total}ページ",
        first: "先頭",
        prev: "前へ",
        next: "次へ",
        last: "末尾",
        firstAria: "最初のページ",
        prevAria: "前のページ",
        nextAria: "次のページ",
        lastAria: "最後のページ"
      }
    }
  },
  ko: {
    app: {
      title: "XIV BiS 라이브러리",
      subtitle: "직업, 역할, 콘텐츠 유형별 커뮤니티 BiS 세트 링크를 한곳에 모았습니다.",
      lastUpdated: "최종 업데이트: {date}",
      notAvailable: "-",
      loading: "BiS 데이터를 불러오는 중...",
      themeSwitch: "{theme} 테마로 전환",
      validationWarnings: "검증 경고"
    },
    common: {
      all: "전체",
      light: "라이트",
      dark: "다크",
      locale: "언어"
    },
    filters: {
      job: "직업",
      category: "카테고리",
      role: "역할",
      search: "검색",
      searchPlaceholder: "직업, 티어, 출처...",
      reset: "필터 초기화",
      secondaryTypeUltimate: "절",
      secondaryTypeCriterion: "변형",
      secondaryTypeUnreal: "환상",
      secondaryAriaCurrent: "{type} 필터, 현재 값: {value}",
      secondaryAriaOptions: "{type} 옵션",
      roles: {
        Tank: "방어",
        Healer: "회복",
        Melee: "근거리 공격",
        "Physical Ranged": "원거리 물리 공격",
        "Magical Ranged": "원거리 마법 공격",
        Limited: "리미티드 잡"
      },
      roleGroups: {
        Tank: "방어",
        Healer: "회복",
        Melee: "근거리 공격",
        "Physical Ranged": "원거리 물리 공격",
        "Magical Ranged": "원거리 마법 공격",
        Limited: "리미티드 잡"
      },
      categories: buildCategoryLabels({
        Savage: "영식",
        Ultimate: "절",
        Prog: "공략",
        Criterion: "이문",
        Unreal: "환 토벌전",
        "Occult Crescent": "초승달 섬",
        Eureka: "금단의 땅 에우레카",
        Other: "기타"
      })
    },
    table: {
      job: "직업",
      role: "역할",
      category: "카테고리",
      info: "정보",
      encounter: "전투",
      tier: "티어",
      notes: "노트",
      damage: "Sim DPS",
      link: "링크",
      source: "출처",
      noMatchingEntries: "일치하는 항목이 없습니다.",
      sortLabel: "{label} 정렬 ({current}). {next}(으)로 전환.",
      sortCurrent: {
        none: "없음",
        asc: "오름차순",
        desc: "내림차순"
      },
      sortNext: {
        asc: "오름차순",
        desc: "내림차순"
      },
      copyLink: "링크 복사",
      simUpdated: "최종 업데이트: {date}",
      pagination: {
        showing: "{total}개 중 {from}-{to}개 표시",
        page: "{current} / {total}페이지",
        first: "처음",
        prev: "이전",
        next: "다음",
        last: "마지막",
        firstAria: "첫 페이지",
        prevAria: "이전 페이지",
        nextAria: "다음 페이지",
        lastAria: "마지막 페이지"
      }
    }
  },
  zh: {
    app: {
      title: "XIV BiS 资料库",
      subtitle: "按职业、职责与内容类型集中整理社区 BiS 配装链接。",
      lastUpdated: "最后更新：{date}",
      notAvailable: "-",
      loading: "正在加载 BiS 数据...",
      themeSwitch: "切换到{theme}主题",
      validationWarnings: "校验警告"
    },
    common: {
      all: "全部",
      light: "浅色",
      dark: "深色",
      locale: "语言"
    },
    filters: {
      job: "职业",
      category: "分类",
      role: "职责",
      search: "搜索",
      searchPlaceholder: "职业、层级、来源...",
      reset: "重置筛选",
      secondaryTypeUltimate: "绝境战",
      secondaryTypeCriterion: "异闻",
      secondaryTypeUnreal: "幻巧",
      secondaryAriaCurrent: "{type}筛选，当前值：{value}",
      secondaryAriaOptions: "{type}选项",
      roles: {
        Tank: "坦克",
        Healer: "治疗",
        Melee: "近战",
        "Physical Ranged": "物理远程",
        "Magical Ranged": "魔法远程",
        Limited: "限定"
      },
      roleGroups: {
        Tank: "坦克",
        Healer: "治疗",
        Melee: "近战",
        "Physical Ranged": "物理远程",
        "Magical Ranged": "魔法远程",
        Limited: "限定"
      },
      categories: buildCategoryLabels({
        Savage: "零式",
        Ultimate: "绝境战",
        Prog: "开荒",
        Criterion: "异闻零式",
        Unreal: "幻巧战",
        "Occult Crescent": "神秘新月",
        Eureka: "优雷卡",
        Other: "其他"
      })
    },
    table: {
      job: "职业",
      role: "职责",
      category: "分类",
      info: "信息",
      encounter: "副本",
      tier: "层级",
      notes: "备注",
      damage: "模拟 DPS",
      link: "链接",
      source: "来源",
      noMatchingEntries: "没有匹配的条目。",
      sortLabel: "{label}排序（{current}）。点击后{next}。",
      sortCurrent: {
        none: "无",
        asc: "升序",
        desc: "降序"
      },
      sortNext: {
        asc: "升序",
        desc: "降序"
      },
      copyLink: "复制链接",
      simUpdated: "最后更新：{date}",
      pagination: {
        showing: "显示第 {from}-{to} 条，共 {total} 条",
        page: "第 {current} / {total} 页",
        first: "首页",
        prev: "上一页",
        next: "下一页",
        last: "末页",
        firstAria: "第一页",
        prevAria: "上一页",
        nextAria: "下一页",
        lastAria: "最后一页"
      }
    }
  }
};

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages
});

