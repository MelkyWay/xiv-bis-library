import fs from "node:fs/promises";
import path from "node:path";

const LOCALES = ["en", "fr", "de", "ja", "ko", "zh-CN", "zh-TW"];

const OPTIONS = {
  category: {
    en: ["Savage", "Prog", "Ultimate", "Criterion", "Unreal", "Occult Crescent", "Other"],
    fr: ["Sadique", "Progression", "Fatal", "Critérium", "Irréel", "Île de Lunule", "Autre"],
    de: ["Episch", "Progression", "Fatal", "Kriterium", "Unwirklich", "Kreszentia", "Sonstiges"],
    ja: ["零式", "攻略", "絶", "異聞", "幻討滅戦", "蜃気楼の島 クレセントアイル", "その他"],
    ko: ["영식", "공략", "얼티밋 레이드", "이문", "환 토벌전", "신비한 초승달", "기타"],
    "zh-CN": ["零式", "开荒", "绝境战", "异闻零式", "幻巧战", "隐月牙环", "其他"],
    "zh-TW": ["零式", "開荒", "絕境戰", "異聞零式", "幻巧戰", "隱月牙環", "其他"]
  },
  locale: {
    en: ["English", "French", "German", "Japanese", "Korean", "Simplified Chinese", "Traditional Chinese", "Multiple locales"],
    fr: ["Anglais", "Français", "Allemand", "Japonais", "Coréen", "Chinois simplifié", "Chinois traditionnel", "Plusieurs langues"],
    de: ["Englisch", "Französisch", "Deutsch", "Japanisch", "Koreanisch", "Vereinfachtes Chinesisch", "Traditionelles Chinesisch", "Mehrere Sprachen"],
    ja: ["英語", "フランス語", "ドイツ語", "日本語", "韓国語", "簡体字中国語", "繁体字中国語", "複数言語"],
    ko: ["영어", "프랑스어", "독일어", "일본어", "한국어", "간체 중국어", "번체 중국어", "여러 언어"],
    "zh-CN": ["英语", "法语", "德语", "日语", "韩语", "简体中文", "繁体中文", "多语言"],
    "zh-TW": ["英語", "法語", "德語", "日語", "韓語", "簡體中文", "繁體中文", "多語言"]
  },
  area: {
    en: ["App UI text", "Contact page / CONTRIBUTING", "Issue template text", "Table labels", "Filters and controls", "Other"],
    fr: ["Texte de l'interface", "Page de contact / CONTRIBUTING", "Texte du modèle d'issue", "Libellés du tableau", "Filtres et contrôles", "Autre"],
    de: ["UI-Text der App", "Kontaktseite / CONTRIBUTING", "Issue-Template-Text", "Tabellenbeschriftungen", "Filter und Steuerelemente", "Sonstiges"],
    ja: ["アプリUIテキスト", "Contactページ / CONTRIBUTING", "Issueテンプレートの文面", "表のラベル", "フィルターと操作", "その他"],
    ko: ["앱 UI 텍스트", "연락처 페이지 / CONTRIBUTING", "이슈 템플릿 텍스트", "표 레이블", "필터와 컨트롤", "기타"],
    "zh-CN": ["应用界面文本", "联系页 / CONTRIBUTING", "Issue 模板文本", "表格标签", "筛选和控件", "其他"],
    "zh-TW": ["應用程式介面文字", "聯絡頁面 / CONTRIBUTING", "Issue 範本文字", "表格標籤", "篩選與控制", "其他"]
  }
};

const shared = {
  en: {
    supportNote:
      "You can fill out this form in English, French, German, Japanese, Korean, Simplified Chinese, or Traditional Chinese.",
    i18nGuidance:
      "Use this form for translation mistakes, missing locale strings, formatting differences, or any other localization issue.",
    category: "Category",
    encounter: "Encounter or Set Name",
    currentUrl: "Current URL",
    replacementUrl: "Replacement URL",
    url: "Set URL",
    source: "Source",
    notes: "Notes",
    currentText: "Current text",
    suggestedText: "Suggested text",
    correction: "Correction requested",
    updateNeeded: "What needs to change?",
    locale: "Affected locale",
    area: "Area",
    page: "Page or section",
    job: "Job",
    descriptions: {
      job: "The job affected by this report.",
      category: "Choose the content category that applies.",
      encounter: "For example Futures Rewritten or 7.4.",
      currentUrl: "The URL that is broken or outdated.",
      replacementUrl: "If you know the correct URL, paste it here.",
      url: "Paste the XIVGear or Etro link.",
      source: "Link to the Balance page, Discord message, spreadsheet, or other source.",
      notes: "Any extra context that helps the maintainer review the report.",
      currentText: "Paste the text that is wrong or awkward.",
      suggestedText: "Provide the corrected text if you have one.",
      correction: "Describe the wrong field and the correct value.",
      updateNeeded: "Explain what is stale and what the update should be.",
      locale: "Select the affected locale.",
      area: "Pick the area that needs attention.",
      page: "For example home page, contact page, footer, or a specific label."
    }
  },
  fr: {
    supportNote:
      "Vous pouvez remplir ce formulaire en anglais, français, allemand, japonais, coréen, chinois simplifié ou chinois traditionnel.",
    i18nGuidance:
      "Utilisez ce formulaire pour les erreurs de traduction, les chaînes manquantes, les différences de format ou tout autre problème de localisation.",
    category: "Catégorie",
    encounter: "Nom du combat ou du set",
    currentUrl: "URL actuelle",
    replacementUrl: "URL de remplacement",
    url: "URL du set",
    source: "Source",
    notes: "Notes",
    currentText: "Texte actuel",
    suggestedText: "Texte suggéré",
    correction: "Correction demandée",
    updateNeeded: "Qu’est-ce qui doit changer ?",
    locale: "Langue concernée",
    area: "Zone",
    page: "Page ou section",
    job: "Job",
    descriptions: {
      job: "Le job concerné par ce signalement.",
      category: "Choisissez la catégorie de contenu concernée.",
      encounter: "Par exemple Futures Rewritten ou 7.4.",
      currentUrl: "L’URL cassée ou obsolète.",
      replacementUrl: "Si vous connaissez la bonne URL, collez-la ici.",
      url: "Collez le lien XIVGear ou Etro.",
      source: "Lien vers la page Balance, un message Discord, une feuille de calcul ou une autre source.",
      notes: "Tout contexte utile pour aider à examiner le signalement.",
      currentText: "Collez le texte incorrect ou maladroit.",
      suggestedText: "Si vous avez une correction, collez-la ici.",
      correction: "Décrivez le champ incorrect et la valeur correcte.",
      updateNeeded: "Expliquez ce qui est obsolète et quelle mise à jour est attendue.",
      locale: "Sélectionnez la langue concernée.",
      area: "Choisissez la zone à corriger.",
      page: "Par exemple page d’accueil, page de contact, pied de page ou libellé précis."
    }
  },
  de: {
    supportNote:
      "Sie können dieses Formular auf Englisch, Französisch, Deutsch, Japanisch, Koreanisch, vereinfachtem Chinesisch oder traditionellem Chinesisch ausfüllen.",
    i18nGuidance:
      "Verwenden Sie dieses Formular für Übersetzungsfehler, fehlende Sprachketten, Formatierungsunterschiede oder andere Lokalisierungsprobleme.",
    category: "Kategorie",
    encounter: "Encounter- oder Set-Name",
    currentUrl: "Aktuelle URL",
    replacementUrl: "Ersatz-URL",
    url: "Set-URL",
    source: "Quelle",
    notes: "Notizen",
    currentText: "Aktueller Text",
    suggestedText: "Vorgeschlagener Text",
    correction: "Angeforderte Korrektur",
    updateNeeded: "Was muss geändert werden?",
    locale: "Betroffene Sprache",
    area: "Bereich",
    page: "Seite oder Abschnitt",
    job: "Job",
    descriptions: {
      job: "Die betroffene Klasse.",
      category: "Wählen Sie die passende Inhaltskategorie.",
      encounter: "Zum Beispiel Futures Rewritten oder 7.4.",
      currentUrl: "Die kaputte oder veraltete URL.",
      replacementUrl: "Wenn Sie die richtige URL kennen, fügen Sie sie hier ein.",
      url: "Fügen Sie den XIVGear- oder Etro-Link ein.",
      source: "Link zur Balance-Seite, Discord-Nachricht, Tabelle oder einer anderen Quelle.",
      notes: "Zusätzlicher Kontext, der die Prüfung erleichtert.",
      currentText: "Fügen Sie den falschen oder unpassenden Text ein.",
      suggestedText: "Wenn Sie einen korrigierten Text haben, fügen Sie ihn hier ein.",
      correction: "Beschreiben Sie das falsche Feld und den richtigen Wert.",
      updateNeeded: "Erklären Sie, was veraltet ist und wie aktualisiert werden sollte.",
      locale: "Wählen Sie die betroffene Sprache aus.",
      area: "Wählen Sie den betroffenen Bereich.",
      page: "Zum Beispiel Startseite, Kontaktseite, Fußzeile oder ein bestimmtes Label."
    }
  },
  ja: {
    supportNote:
      "このフォームは英語、フランス語、ドイツ語、日本語、韓国語、簡体字中国語、繁体字中国語で記入できます。",
    i18nGuidance:
      "翻訳ミス、ロケール文字列の不足、書式の違い、その他のローカライズ問題に使ってください。",
    category: "カテゴリ",
    encounter: "対象の戦闘名またはセット名",
    currentUrl: "現在の URL",
    replacementUrl: "代わりの URL",
    url: "セット URL",
    source: "ソース",
    notes: "メモ",
    currentText: "現在の文言",
    suggestedText: "提案文",
    correction: "修正内容",
    updateNeeded: "何を変更する必要がありますか？",
    locale: "対象ロケール",
    area: "対象箇所",
    page: "ページまたはセクション",
    job: "ジョブ",
    descriptions: {
      job: "対象ジョブ。",
      category: "該当するコンテンツカテゴリを選んでください。",
      encounter: "たとえば Futures Rewritten や 7.4。",
      currentUrl: "壊れている、または古い URL。",
      replacementUrl: "正しい URL が分かる場合はここに貼り付けてください。",
      url: "XIVGear または Etro のリンクを貼り付けてください。",
      source: "The Balance ページ、Discord メッセージ、表計算シートなどのソースを記載してください。",
      notes: "確認に役立つ追加情報。",
      currentText: "誤っている、または不自然な文言を貼り付けてください。",
      suggestedText: "修正版があればここに記入してください。",
      correction: "誤っている項目と正しい値を説明してください。",
      updateNeeded: "何が古く、どのように更新すべきかを説明してください。",
      locale: "対象ロケールを選んでください。",
      area: "対象箇所を選んでください。",
      page: "たとえばホームページ、連絡先ページ、フッター、特定のラベル。"
    }
  },
  ko: {
    supportNote:
      "이 양식은 영어, 프랑스어, 독일어, 일본어, 한국어, 간체 중국어, 번체 중국어로 작성할 수 있습니다.",
    i18nGuidance:
      "번역 오류, 누락된 로케일 문자열, 형식 차이 또는 기타 현지화 문제에 사용해 주세요.",
    category: "카테고리",
    encounter: "전투 또는 세트 이름",
    currentUrl: "현재 URL",
    replacementUrl: "대체 URL",
    url: "세트 URL",
    source: "출처",
    notes: "메모",
    currentText: "현재 텍스트",
    suggestedText: "제안 문구",
    correction: "수정 요청",
    updateNeeded: "무엇을 변경해야 하나요?",
    locale: "영향받는 로케일",
    area: "영역",
    page: "페이지 또는 섹션",
    job: "직업",
    descriptions: {
      job: "영향을 받는 직업.",
      category: "해당하는 콘텐츠 카테고리를 선택하세요.",
      encounter: "예: Futures Rewritten 또는 7.4.",
      currentUrl: "깨졌거나 오래된 URL.",
      replacementUrl: "올바른 URL을 알고 있다면 여기에 붙여넣어 주세요.",
      url: "XIVGear 또는 Etro 링크를 붙여넣어 주세요.",
      source: "The Balance 페이지, Discord 메시지, 스프레드시트 또는 기타 출처의 링크를 적어 주세요.",
      notes: "검토에 도움이 되는 추가 정보.",
      currentText: "잘못되었거나 어색한 텍스트를 붙여넣어 주세요.",
      suggestedText: "수정 문구가 있으면 여기에 적어 주세요.",
      correction: "잘못된 필드와 올바른 값을 설명해 주세요.",
      updateNeeded: "무엇이 오래되었고 어떤 업데이트가 필요한지 설명해 주세요.",
      locale: "영향받는 로케일을 선택하세요.",
      area: "영향받는 영역을 선택하세요.",
      page: "예: 홈 페이지, 연락처 페이지, 푸터 또는 특정 레이블."
    }
  },
  "zh-CN": {
    supportNote:
      "您可以使用英语、法语、德语、日语、韩语、简体中文或繁体中文填写此表单。",
    i18nGuidance:
      "用于翻译错误、缺失的区域字符串、格式差异或其他本地化问题。",
    category: "分类",
    encounter: "副本或套装名称",
    currentUrl: "当前 URL",
    replacementUrl: "替换链接",
    url: "套装链接",
    source: "来源",
    notes: "备注",
    currentText: "当前文本",
    suggestedText: "建议文本",
    correction: "请求更正",
    updateNeeded: "需要更改什么？",
    locale: "受影响的区域",
    area: "区域",
    page: "页面或章节",
    job: "职业",
    descriptions: {
      job: "受影响的职业。",
      category: "请选择对应的内容分类。",
      encounter: "例如 Futures Rewritten 或 7.4。",
      currentUrl: "失效或过时的链接。",
      replacementUrl: "如果您知道正确的 URL，请贴在这里。",
      url: "请粘贴 XIVGear 或 Etro 链接。",
      source: "请提供 The Balance 页面、Discord 消息、表格或其他来源。",
      notes: "有助于审核的补充信息。",
      currentText: "粘贴有误或不自然的文本。",
      suggestedText: "如果有修正文本，请贴在这里。",
      correction: "说明错误字段和正确值。",
      updateNeeded: "说明哪里过时，以及应如何更新。",
      locale: "请选择受影响的区域。",
      area: "请选择需要关注的区域。",
      page: "例如首页、联系页面、页脚或具体标签。"
    }
  },
  "zh-TW": {
    supportNote:
      "您可以使用英語、法語、德語、日語、韓語、簡體中文或繁體中文填寫此表單。",
    i18nGuidance:
      "用於翻譯錯誤、缺少的地區字串、格式差異或其他在地化問題。",
    category: "分類",
    encounter: "副本或套裝名稱",
    currentUrl: "目前 URL",
    replacementUrl: "替換連結",
    url: "套裝連結",
    source: "來源",
    notes: "備註",
    currentText: "目前文字",
    suggestedText: "建議文字",
    correction: "請求更正",
    updateNeeded: "需要更改什麼？",
    locale: "受影響的地區",
    area: "區域",
    page: "頁面或章節",
    job: "職業",
    descriptions: {
      job: "受影響的職業。",
      category: "請選擇對應的內容分類。",
      encounter: "例如 Futures Rewritten 或 7.4。",
      currentUrl: "失效或過時的連結。",
      replacementUrl: "如果您知道正確的 URL，請貼在這裡。",
      url: "請貼上 XIVGear 或 Etro 連結。",
      source: "請提供 The Balance 頁面、Discord 訊息、試算表或其他來源。",
      notes: "有助於審查的補充資訊。",
      currentText: "貼上有誤或不自然的文字。",
      suggestedText: "如果有修正文字，請貼在這裡。",
      correction: "說明錯誤欄位和正確值。",
      updateNeeded: "說明哪裡過時，以及應如何更新。",
      locale: "請選擇受影響的地區。",
      area: "請選擇需要關注的區域。",
      page: "例如首頁、聯絡頁面、頁尾或特定標籤。"
    }
  }
};

const formSpecs = {
  "report-broken-link.yml": {
    labels: ["broken-link"],
    title: {
      en: "Report Broken Link",
      fr: "Signaler un lien cassé",
      de: "Kaputten Link melden",
      ja: "リンク切れを報告",
      ko: "깨진 링크 제보",
      "zh-CN": "回报失效链接",
      "zh-TW": "回報失效連結"
    },
    description: {
      en: "Report a BiS link that is broken or points to the wrong set",
      fr: "Signaler un lien BiS cassé ou pointant vers le mauvais set",
      de: "Einen kaputten oder falschen BiS-Link melden",
      ja: "壊れた、または誤った BiS リンクを報告",
      ko: "깨졌거나 잘못된 BiS 링크를 제보",
      "zh-CN": "回报失效或错误的 BiS 链接",
      "zh-TW": "回報失效或錯誤的 BiS 連結"
    }
  },
  "suggest-new-set.yml": {
    labels: ["new-set"],
    title: {
      en: "Suggest New Set",
      fr: "Proposer un nouveau set",
      de: "Neues Set vorschlagen",
      ja: "新しいセットを提案",
      ko: "새 세트 제안",
      "zh-CN": "提议新套装",
      "zh-TW": "提議新套裝"
    },
    description: {
      en: "Suggest a new BiS, prog, or encounter set",
      fr: "Proposer un nouveau set BiS, prog ou encounter",
      de: "Ein neues BiS-, Prog- oder Encounter-Set vorschlagen",
      ja: "新しい BiS、進行用、または対象戦闘向けセットを提案",
      ko: "새로운 BiS, 진행용 또는 전투용 세트를 제안",
      "zh-CN": "提议新的 BiS、开荒或副本套装",
      "zh-TW": "提議新的 BiS、開荒或副本套裝"
    }
  },
  "report-stale-entry.yml": {
    labels: ["stale-data"],
    title: {
      en: "Report Stale Entry",
      fr: "Signaler une entrée obsolète",
      de: "Veralteten Eintrag melden",
      ja: "古い項目を報告",
      ko: "오래된 항목 제보",
      "zh-CN": "回报过期条目",
      "zh-TW": "回報過期條目"
    },
    description: {
      en: "Report a set that needs to be updated after a patch or balance change",
      fr: "Signaler un set à mettre à jour après un patch ou un changement d’équilibrage",
      de: "Ein Set melden, das nach einem Patch oder einer Balance-Änderung aktualisiert werden muss",
      ja: "パッチや調整後に更新が必要なセットを報告",
      ko: "패치나 밸런스 변경 후 업데이트가 필요한 세트를 제보",
      "zh-CN": "回报需要在补丁或平衡调整后更新的套装",
      "zh-TW": "回報需要在補丁或平衡調整後更新的套裝"
    }
  },
  "report-data-correction.yml": {
    labels: ["data-correction"],
    title: {
      en: "Report Data Correction",
      fr: "Signaler une correction de données",
      de: "Datenkorrektur melden",
      ja: "データ修正を報告",
      ko: "데이터 수정 제보",
      "zh-CN": "回报数据更正",
      "zh-TW": "回報資料更正"
    },
    description: {
      en: "Report a wrong field, label, or metadata issue in the dataset",
      fr: "Signaler un champ, libellé ou métadonnée incorrect(e) dans les données",
      de: "Einen falschen Feld-, Label- oder Metadatenwert melden",
      ja: "データセット内の誤った項目、ラベル、メタデータを報告",
      ko: "잘못된 필드, 레이블 또는 메타데이터 문제를 제보",
      "zh-CN": "回报数据集中的错误字段、标签或元数据问题",
      "zh-TW": "回報資料集中的錯誤欄位、標籤或中繼資料問題"
    }
  },
  "i18n-issue.yml": {
    labels: ["i18n"],
    title: {
      en: "Report I18n Issue",
      fr: "Signaler un problème i18n",
      de: "i18n-Problem melden",
      ja: "i18n 問題を報告",
      ko: "i18n 문제 제보",
      "zh-CN": "回报 i18n 问题",
      "zh-TW": "回報 i18n 問題"
    },
    description: {
      en: "Report a translation, locale formatting, or localized text issue",
      fr: "Signaler un problème de traduction, de format localisé ou de texte localisé",
      de: "Einen Übersetzungs-, Lokalisierungsformat- oder lokalisierten Textfehler melden",
      ja: "翻訳、ロケール書式、ローカライズ文言の問題を報告",
      ko: "번역, 로케일 형식 또는 현지화된 텍스트 문제를 제보",
      "zh-CN": "回报翻译、区域格式或本地化文本问题",
      "zh-TW": "回報翻譯、地區格式或在地化文字問題"
    }
  }
};

function getLocalizedValue(map, locale) {
  return map[locale] ?? map.en;
}

function getLocalizedOptions(key, locale) {
  return OPTIONS[key][locale] ?? OPTIONS[key].en;
}

function renderMarkdownIntro(locale) {
  const text = locale === "en" ? shared.en.supportNote : shared[locale].supportNote;
  return `  - type: markdown
    attributes:
      value: |
        ${text}
`;
}

function makeFieldLines({ type, id, label, description, options, required }) {
  const lines = [`  - type: ${type}`];
  if (id) {
    lines.push(`    id: ${id}`);
  }
  lines.push("    attributes:");
  lines.push(`      label: ${JSON.stringify(label)}`);
  if (description) {
    lines.push(`      description: ${JSON.stringify(description)}`);
  }
  if (options) {
    lines.push("      options:");
    for (const option of options) {
      lines.push(`        - ${JSON.stringify(option)}`);
    }
  }
  if (required) {
    lines.push("    validations:");
    lines.push("      required: true");
  }
  return lines.join("\n");
}

function renderForm(locale, fileName, spec) {
  const copy = shared[locale];
  const title = getLocalizedValue(spec.title, locale);
  const description = getLocalizedValue(spec.description, locale);
  const lines = [
    "# AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.",
    `# Source: scripts/tools/lib/generate-issue-templates.mjs (${locale})`,
    `name: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `labels: [${spec.labels.map((label) => JSON.stringify(label)).join(", ")}]`,
    "body:",
    renderMarkdownIntro(locale)
  ];

  const addInput = (id, key, required = false) =>
    lines.push(
      makeFieldLines({
        type: "input",
        id,
        label: copy[key],
        description: copy.descriptions[key],
        required
      })
    );

  const addTextarea = (id, key, required = false) =>
    lines.push(
      makeFieldLines({
        type: "textarea",
        id,
        label: copy[key],
        description: copy.descriptions[key],
        required
      })
    );

  const addDropdown = (id, key, options, required = false) =>
    lines.push(
      makeFieldLines({
        type: "dropdown",
        id,
        label: copy[key],
        options,
        required
      })
    );

  if (fileName === "i18n-issue.yml") {
    addDropdown("locale", "locale", getLocalizedOptions("locale", locale), true);
    addDropdown("area", "area", getLocalizedOptions("area", locale), true);
    addInput("page", "page", true);
    addTextarea("current-text", "currentText", true);
    addTextarea("suggested-text", "suggestedText", false);
    addTextarea("source", "source", true);
    addTextarea("notes", "notes", false);
    return `${lines.join("\n")}\n`;
  }

  addInput("job", "job", true);
  addDropdown("category", "category", getLocalizedOptions("category", locale), true);
  addInput("encounter", "encounter", true);

  if (fileName === "report-broken-link.yml") {
    addInput("current-url", "currentUrl", true);
    addInput("replacement-url", "replacementUrl", false);
    addTextarea("source", "source", true);
    addTextarea("notes", "notes", false);
  } else if (fileName === "suggest-new-set.yml") {
    addInput("url", "url", true);
    addTextarea("source", "source", true);
    addTextarea("notes", "notes", false);
  } else if (fileName === "report-stale-entry.yml") {
    addInput("current-url", "currentUrl", true);
    addTextarea("update-needed", "updateNeeded", true);
    addTextarea("source", "source", true);
    addTextarea("notes", "notes", false);
  } else if (fileName === "report-data-correction.yml") {
    addTextarea("correction", "correction", true);
    addTextarea("source", "source", true);
    addTextarea("notes", "notes", false);
  }

  return `${lines.join("\n")}\n`;
}

export async function generateIssueTemplates({ rootDir, outputDir }) {
  const sourceDir = path.resolve(rootDir, ".github/ISSUE_TEMPLATE");
  await fs.mkdir(outputDir, { recursive: true });

  for (const [fileName, spec] of Object.entries(formSpecs)) {
    const sourcePath = path.resolve(sourceDir, fileName);
    const englishSource = await fs.readFile(sourcePath, "utf8");
    await fs.writeFile(path.resolve(outputDir, fileName), englishSource, "utf8");

    for (const locale of LOCALES.filter((value) => value !== "en")) {
      const outputName = fileName.replace(/\.yml$/, `.${locale}.yml`);
      const output = renderForm(locale, fileName, spec);
      await fs.writeFile(path.resolve(outputDir, outputName), output, "utf8");
    }
  }
}
