import type { SupportedLocale } from "../i18n";

const ENCOUNTER_KEYS = [
  "Futures Rewritten",
  "Dragonsong's Reprise",
  "The Omega Protocol",
  "The Epic of Alexander",
  "The Weapon's Refrain",
  "The Unending Coil of Bahamut"
] as const;

type EncounterName = (typeof ENCOUNTER_KEYS)[number];

const ULTIMATE_TRANSLATIONS: Record<SupportedLocale, Record<EncounterName, string>> = {
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
  // Korean and Chinese regional services are not mirrored on Lodestone's language domains.
  // Until directly verified from official regional duty databases, keep official English names.
  ko: {
    "Futures Rewritten": "Futures Rewritten",
    "Dragonsong's Reprise": "Dragonsong's Reprise",
    "The Omega Protocol": "The Omega Protocol",
    "The Epic of Alexander": "The Epic of Alexander",
    "The Weapon's Refrain": "The Weapon's Refrain",
    "The Unending Coil of Bahamut": "The Unending Coil of Bahamut"
  },
  zh: {
    "Futures Rewritten": "Futures Rewritten",
    "Dragonsong's Reprise": "Dragonsong's Reprise",
    "The Omega Protocol": "The Omega Protocol",
    "The Epic of Alexander": "The Epic of Alexander",
    "The Weapon's Refrain": "The Weapon's Refrain",
    "The Unending Coil of Bahamut": "The Unending Coil of Bahamut"
  }
};

function toSupportedLocale(locale: string): SupportedLocale {
  const normalized = locale.toLowerCase().split("-")[0];
  if (normalized === "fr" || normalized === "de" || normalized === "ja" || normalized === "ko" || normalized === "zh") {
    return normalized;
  }
  return "en";
}

export function localizeUltimateName(name: string, locale: string): string {
  if (!ENCOUNTER_KEYS.includes(name as EncounterName)) {
    return name;
  }

  const resolvedLocale = toSupportedLocale(locale);
  return ULTIMATE_TRANSLATIONS[resolvedLocale][name as EncounterName] ?? name;
}
