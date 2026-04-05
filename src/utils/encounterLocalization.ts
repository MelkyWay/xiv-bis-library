import { ENCOUNTER_CATEGORY_BY_NAME, ULTIMATE_ORDER } from "../config/encounters";
import type { EncounterCategory, EncounterName } from "../config/encounters";
import type { UltimateEncounter } from "../config/encounters.generated";
import type { SupportedLocale } from "../i18n";

const ENCOUNTER_KEYS = ULTIMATE_ORDER;

const ULTIMATE_TRANSLATIONS: Record<SupportedLocale, Record<UltimateEncounter, string>> = {
  en: {
    "Futures Rewritten": "Futures Rewritten",
    "Dragonsong's Reprise": "Dragonsong's Reprise",
    "The Omega Protocol": "The Omega Protocol",
    "The Epic of Alexander": "The Epic of Alexander",
    "The Weapon's Refrain": "The Weapon's Refrain",
    "The Unending Coil of Bahamut": "The Unending Coil of Bahamut"
  },
  fr: {
    "Futures Rewritten": "Avenirs Réécrits",
    "Dragonsong's Reprise": "La Guerre du Chant des Dragons",
    "The Omega Protocol": "Le Protocole Oméga",
    "The Epic of Alexander": "L'Odyssée d'Alexander",
    "The Weapon's Refrain": "La Fantasmagorie d'Ultima",
    "The Unending Coil of Bahamut": "L'Abîme infini de Bahamut"
  },
  de: {
    "Futures Rewritten": "Eine zweite Zukunft",
    "Dragonsong's Reprise": "Drachenkrieg",
    "The Omega Protocol": "Omega",
    "The Epic of Alexander": "Alexander",
    "The Weapon's Refrain": "Heldenlied von Ultima",
    "The Unending Coil of Bahamut": "Endlose Schatten von Bahamut"
  },
  ja: {
    "Futures Rewritten": "絶もうひとつの未来",
    "Dragonsong's Reprise": "絶竜詩戦争",
    "The Epic of Alexander": "絶アレキサンダー討滅戦",
    "The Weapon's Refrain": "絶アルテマウェポン破壊作戦",
    "The Omega Protocol": "絶オメガ検証戦",
    "The Unending Coil of Bahamut": "絶バハムート討滅戦"
  },
  ko: {
    "Futures Rewritten": "또 하나의 미래",
    "Dragonsong's Reprise": "용시전쟁",
    "The Omega Protocol": "오메가 검증전",
    "The Epic of Alexander": "알렉산더 토벌전",
    "The Weapon's Refrain": "알테마 웨폰 파괴 작전",
    "The Unending Coil of Bahamut": "바하무트 토벌전"
  },
  "zh-CN": {
    "Futures Rewritten": "光暗未来绝境战",
    "Dragonsong's Reprise": "幻想龙诗绝境战",
    "The Omega Protocol": "欧米茄绝境验证战",
    "The Epic of Alexander": "亚历山大绝境战",
    "The Weapon's Refrain": "究极神兵绝境战",
    "The Unending Coil of Bahamut": "巴哈姆特绝境战"
  },
  "zh-TW": {
    "Futures Rewritten": "光暗未來絕境戰",
    "Dragonsong's Reprise": "幻想龍詩絕境戰",
    "The Omega Protocol": "歐米茄絕境驗證戰",
    "The Epic of Alexander": "亞歷山大絕境戰",
    "The Weapon's Refrain": "究極神兵絕境戰",
    "The Unending Coil of Bahamut": "巴哈姆特絕境戰"
  }
};

const CRITERION_TRANSLATIONS: Record<SupportedLocale, Partial<Record<EncounterName, string>>> = {
  en: {},
  fr: {
    "Another Merchant's Tale": "Contes du Camelot",
    "Another Aloalo Island": "L'Île d'Aloalo",
    "Another Mount Rokkon": "Le Mont Rokkon",
    "Another Sil'dihn Subterrane": "Les Canalisations Sildiennes"
  },
  de: {
    "Another Merchant's Tale": "Des Händlers kuriose Liebesmüh",
    "Another Aloalo Island": "Kurioses Aloalo",
    "Another Mount Rokkon": "Der kuriose Rokkon",
    "Another Sil'dihn Subterrane": "Die kuriose Unterstadt von Sil'dih"
  },
  ja: {
    "Another Merchant's Tale": "異聞商人物語",
    "Another Aloalo Island": "異聞アロアロ島",
    "Another Mount Rokkon": "異聞六根山",
    "Another Sil'dihn Subterrane": "異聞シラディハ水道"
  },
  ko: {
    "Another Merchant's Tale": "번외 상인 이야기",
    "Another Aloalo Island": "번외 아로아로 섬",
    "Another Mount Rokkon": "번외 육근산",
    "Another Sil'dihn Subterrane": "번외 실디하 지하수도"
  },
  "zh-CN": {
    "Another Merchant's Tale": "异闻商客奇谭",
    "Another Aloalo Island": "异闻阿罗阿罗岛",
    "Another Mount Rokkon": "异闻六根山",
    "Another Sil'dihn Subterrane": "异闻希拉狄哈水道"
  },
  "zh-TW": {
    "Another Merchant's Tale": "異聞商客物語",
    "Another Aloalo Island": "異聞阿羅阿羅島",
    "Another Mount Rokkon": "異聞六根山",
    "Another Sil'dihn Subterrane": "異聞希拉迪哈下水道"
  }
};

const UNREAL_TRANSLATIONS: Record<SupportedLocale, Partial<Record<EncounterName, string>>> = {
  en: {},
  fr: {
    "Tsukuyomi's Pain": "Castrum Fluminis"
  },
  de: {
    "Tsukuyomi's Pain": "Tsukuyomi"
  },
  ja: {
    "Tsukuyomi's Pain": "ツクヨミ討滅戦"
  },
  ko: {
    "Tsukuyomi's Pain": "환 츠쿠요미 토벌전"
  },
  "zh-CN": {
    "Tsukuyomi's Pain": "月读幻巧战"
  },
  "zh-TW": {
    "Tsukuyomi's Pain": "月讀幻巧戰"
  }
};

function toSupportedLocale(locale: string): SupportedLocale {
  const normalized = locale.toLowerCase();
  if (normalized === "zh-tw" || normalized === "zh-hant" || normalized.startsWith("zh-tw-")) {
    return "zh-TW";
  }
  if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh-hans" || normalized.startsWith("zh-cn-")) {
    return "zh-CN";
  }

  const base = normalized.split("-")[0];
  if (base === "fr" || base === "de" || base === "ja" || base === "ko") {
    return base;
  }
  return "en";
}

export function localizeUltimateName(name: string, locale: string): string {
  if (!ENCOUNTER_KEYS.includes(name as UltimateEncounter)) {
    return name;
  }

  const resolvedLocale = toSupportedLocale(locale);
  return ULTIMATE_TRANSLATIONS[resolvedLocale][name as UltimateEncounter] ?? name;
}

export function localizeEncounterName(name: string, locale: string, category?: EncounterCategory): string {
  const encounterCategory = category ?? ENCOUNTER_CATEGORY_BY_NAME[name as EncounterName];
  if (!encounterCategory) {
    return name;
  }

  const resolvedLocale = toSupportedLocale(locale);

  if (encounterCategory === "Ultimate") {
    return localizeUltimateName(name, locale);
  }

  if (encounterCategory === "Criterion") {
    return CRITERION_TRANSLATIONS[resolvedLocale][name as EncounterName] ?? name;
  }

  if (encounterCategory === "Unreal") {
    return UNREAL_TRANSLATIONS[resolvedLocale][name as EncounterName] ?? name;
  }

  return name;
}
