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
  const normalized = locale.toLowerCase().split("-")[0];
  if (normalized === "ko") {
    return KO_JOB_NAMES[job] ?? job;
  }
  return job;
}
