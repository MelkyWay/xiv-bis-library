const FR_JOB_ABBREVIATIONS: Record<string, string> = {
  PLD: "PLD",
  WAR: "GUE",
  DRK: "CHN",
  GNB: "PSB",
  WHM: "MBL",
  SCH: "ÉRU",
  AST: "AST",
  SGE: "SAG",
  MNK: "MOI",
  DRG: "DRG",
  NIN: "NIN",
  SAM: "SAM",
  RPR: "FCH",
  VPR: "VPR",
  BRD: "BRD",
  MCH: "MCH",
  DNC: "DNS",
  BLM: "MNO",
  SMN: "INV",
  RDM: "MRG",
  PCT: "PIC",
  BLU: "MBU",
  BST: "BST"
};

const DE_JOB_ABBREVIATIONS: Record<string, string> = {
  PLD: "PLD",
  WAR: "KRG",
  DRK: "DKR",
  GNB: "REV",
  WHM: "WMA",
  SCH: "GLT",
  AST: "AST",
  SGE: "WEI",
  MNK: "MÖN",
  DRG: "DRG",
  NIN: "NIN",
  SAM: "SAM",
  RPR: "SNT",
  VPR: "VPR",
  BRD: "BRD",
  MCH: "MCH",
  DNC: "TÄN",
  BLM: "SMA",
  SMN: "BSW",
  RDM: "RMA",
  PCT: "PKT",
  BLU: "BMA",
  BST: "BST"
};

const ZH_CN_JOB_NAMES: Record<string, string> = {
  PLD: "骑士",
  WAR: "战士",
  DRK: "暗黑骑士",
  GNB: "绝枪战士",
  WHM: "白魔法师",
  SCH: "学者",
  AST: "占星术士",
  SGE: "贤者",
  MNK: "武僧",
  DRG: "龙骑士",
  NIN: "忍者",
  SAM: "武士",
  RPR: "钐镰客",
  VPR: "蝰蛇",
  BRD: "吟游诗人",
  MCH: "机工士",
  DNC: "舞者",
  BLM: "黑魔法师",
  SMN: "召唤师",
  RDM: "赤魔法师",
  PCT: "绘灵法师",
  BLU: "青魔法师"
};

const ZH_TW_JOB_NAMES: Record<string, string> = {
  PLD: "騎士",
  WAR: "戰士",
  DRK: "暗黑騎士",
  GNB: "絕槍戰士",
  WHM: "白魔道士",
  SCH: "學者",
  AST: "占星術師",
  SGE: "賢者",
  MNK: "武僧",
  DRG: "龍騎士",
  NIN: "忍者",
  SAM: "武士",
  RPR: "奪魂者",
  VPR: "毒蛇劍士",
  BRD: "吟遊詩人",
  MCH: "機工士",
  DNC: "舞者",
  BLM: "黑魔道士",
  SMN: "召喚士",
  RDM: "赤魔道士",
  PCT: "繪靈法師",
  BLU: "青魔道士"
};

const KO_JOB_NAMES: Record<string, string> = {
  PLD: "나이트",
  WAR: "전사",
  DRK: "암흑기사",
  GNB: "건브레이커",
  WHM: "백마도사",
  SCH: "학자",
  AST: "점성술사",
  SGE: "현자",
  MNK: "몽크",
  DRG: "용기사",
  NIN: "닌자",
  SAM: "사무라이",
  RPR: "리퍼",
  VPR: "바이퍼",
  BRD: "음유시인",
  MCH: "기공사",
  DNC: "무도가",
  BLM: "흑마도사",
  SMN: "소환사",
  RDM: "적마도사",
  PCT: "픽토맨서",
  BLU: "청마도사",
  BST: "비스트마스터"
};

export function localizeJobName(job: string, locale: string): string {
  const normalized = locale.toLowerCase();

  if (normalized === "zh-tw" || normalized === "zh-hant" || normalized.startsWith("zh-tw-")) {
    return ZH_TW_JOB_NAMES[job] ?? job;
  }
  if (normalized === "zh" || normalized === "zh-cn" || normalized === "zh-hans" || normalized.startsWith("zh-cn-")) {
    return ZH_CN_JOB_NAMES[job] ?? job;
  }

  const base = normalized.split("-")[0];
  if (base === "fr") {
    return FR_JOB_ABBREVIATIONS[job] ?? job;
  }
  if (base === "de") {
    return DE_JOB_ABBREVIATIONS[job] ?? job;
  }
  if (base === "ko") {
    return KO_JOB_NAMES[job] ?? job;
  }
  return job;
}
