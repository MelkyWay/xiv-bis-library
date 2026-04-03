import type { SupportedLocale } from "../i18n";

export type InfoPageKey = "about" | "dataDisclaimer" | "privacy" | "contact" | "legal";

export type InfoSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type InfoPageContent = {
  title: string;
  intro: string;
  sections: InfoSection[];
};

type InfoBundle = {
  close: string;
  ariaPanel: string;
  ariaFooter: string;
  footer: Record<InfoPageKey | "home", string>;
  pages: Record<InfoPageKey, InfoPageContent>;
};

const EN_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "About XIV BiS Library",
    intro:
      "XIV BiS Library centralizes community Best-in-Slot links for Final Fantasy XIV, grouped by job, role, and content category.",
    sections: [
      {
        title: "What This Site Is For",
        bullets: [
          "Quickly find trusted BiS resources without opening multiple websites.",
          "Filter by role, job, category, and encounter context.",
          "Share filtered views and save personal favorites in your browser."
        ]
      },
      {
        title: "Maintenance",
        paragraphs: [
          "Entries are curated from community resources and updated when maintainers review and import changes.",
          "The displayed update date reflects the latest deployed data snapshot."
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "Data Sources & Disclaimer",
    intro: "This project references external community resources and does not guarantee perfect accuracy at all times.",
    sections: [
      {
        title: "Sources",
        bullets: [
          "Links and references are sourced from community-maintained guides, resources and gear planners.",
          "Each row includes a source field to show the original provider when available."
        ]
      },
      {
        title: "Important Disclaimer",
        bullets: [
          "Entries may become outdated after game patches, job changes, or guide revisions.",
          "Always verify details against the original source before finalizing your setup.",
          "This site is an independent community project and is not affiliated with or endorsed by Square Enix or, indeed, anyone or anything else."
        ]
      }
    ]
  },
  privacy: {
    title: "Privacy",
    intro: "This site is designed to be lightweight and privacy-conscious.",
    sections: [
      {
        title: "Data Stored Locally",
        bullets: [
          "Theme preference is stored in localStorage, on your device.",
          "Language preference is stored in localStorage and URL parameters, on your device.",
          "Favorite entries are stored in localStorage, on your device."
        ]
      },
      {
        title: "What We Do Not Collect",
        bullets: [
          "No account registration is required.",
          "No personal profile data is collected by the app itself.",
          "No server-side user database is used for this site."
        ]
      }
    ]
  },
  contact: {
    title: "Contact & Feedback",
    intro: "Feedback helps keep the library useful and current.",
    sections: [
      {
        title: "Report Issues",
        paragraphs: ["Open an issue in the GitHub repository for bugs, broken links, or outdated entries."]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "Legal Notice",
    intro: "Basic usage and attribution terms for this project.",
    sections: [
      {
        title: "Usage",
        bullets: [
          "This site is provided as-is, without warranty of completeness or fitness for a particular purpose.",
          "Users are responsible for validating the external resources they choose to use."
        ]
      },
      {
        title: "Trademarks and Copyright",
        bullets: [
          "Final Fantasy XIV and related names are property of Square Enix.",
          "External guides, logos, and linked resources remain property of their respective owners."
        ]
      }
    ]
  }
};

const FR_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "À propos de XIV BiS Library",
    intro: "XIV BiS Library centralise les liens BiS de la communauté pour Final Fantasy XIV, par job, rôle et type de contenu.",
    sections: [
      {
        title: "Objectif du site",
        bullets: [
          "Trouver rapidement des ressources BiS fiables.",
          "Filtrer par rôle, job, catégorie et rencontre.",
          "Partager des vues filtrées et sauvegarder vos favoris."
        ]
      },
      {
        title: "Maintenance",
        paragraphs: [
          "Les entrées sont importées depuis des ressources communautaires et mises à jour après revue.",
          "La date affichée correspond au dernier déploiement des données."
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "Sources de données et avertissement",
    intro: "Ce projet référence des ressources communautaires externes et ne garantit pas une exactitude parfaite en permanence.",
    sections: [
      {
        title: "Sources",
        bullets: [
          "Les liens proviennent de guides et plateformes communautaires.",
          "Chaque ligne affiche la source d’origine quand elle est disponible."
        ]
      },
      {
        title: "Avertissement important",
        bullets: [
          "Les entrées peuvent devenir obsolètes après un patch ou des ajustements de job.",
          "Vérifiez toujours la source d’origine avant de vous lancer.",
          "Ce site est un projet communautaire indépendant, non affilié à Square Enix, ni qui ou quoi que ce soit d'autre."
        ]
      }
    ]
  },
  privacy: {
    title: "Confidentialité",
    intro: "Le site est conçu pour être léger et respectueux de la vie privée.",
    sections: [
      {
        title: "Données stockées localement",
        bullets: [
          "Le thème est stocké dans localStorage, sur votre appareil.",
          "La langue est stockée dans localStorage et dans l’URL, sur votre appareil.",
          "Les favoris sont stockés localement sur votre appareil."
        ]
      },
      {
        title: "Ce que nous ne collectons pas",
        bullets: [
          "Aucun compte n’est requis.",
          "Aucune donnée de profil n’est collectée par l’application.",
          "Aucune base utilisateur côté serveur n’est utilisée."
        ]
      }
    ]
  },
  contact: {
    title: "Contact et retours",
    intro: "Vos retours aident à maintenir la bibliothèque utile et à jour.",
    sections: [
      {
        title: "Signaler un problème",
        paragraphs: ["Ouvrez une issue GitHub pour les bugs, liens cassés ou entrées obsolètes."]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "Mentions légales",
    intro: "Conditions d’utilisation et d’attribution du projet.",
    sections: [
      {
        title: "Utilisation",
        bullets: [
          "Ce site est fourni en l’état, sans garantie.",
          "L’utilisateur reste responsable de la vérification des ressources externes."
        ]
      },
      {
        title: "Marques et droits",
        bullets: [
          "Final Fantasy XIV et noms associés appartiennent à Square Enix.",
          "Les guides et ressources externes appartiennent à leurs propriétaires respectifs."
        ]
      }
    ]
  }
};

const DE_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "Über XIV BiS Library",
    intro: "XIV BiS Library bündelt Community-BiS-Links für Final Fantasy XIV nach Job, Rolle und Inhaltstyp.",
    sections: [
      {
        title: "Wofür die Seite da ist",
        bullets: [
          "Schnell verlässliche BiS-Ressourcen finden.",
          "Nach Rolle, Job, Kategorie und Encounter filtern.",
          "Gefilterte Ansichten teilen und Favoriten speichern."
        ]
      },
      {
        title: "Pflege",
        paragraphs: [
          "Einträge stammen aus Community-Quellen und werden nach Prüfung aktualisiert.",
          "Das angezeigte Datum entspricht dem letzten Daten-Deployment."
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "Datenquellen & Hinweis",
    intro: "Dieses Projekt verweist auf externe Community-Ressourcen und kann keine vollständige Fehlerfreiheit garantieren.",
    sections: [
      {
        title: "Quellen",
        bullets: [
          "Links stammen aus Community-Guides und Gear-Planern.",
          "Jede Zeile zeigt nach Möglichkeit die Originalquelle."
        ]
      },
      {
        title: "Wichtiger Hinweis",
        bullets: [
          "Einträge können nach Patches oder Jobänderungen veralten.",
          "Bitte vor Nutzung immer die Originalquelle prüfen.",
          "Diese Seite ist ein unabhängiges Community-Projekt ohne Verbindung zu Square Enix."
        ]
      }
    ]
  },
  privacy: {
    title: "Datenschutz",
    intro: "Die Seite ist leichtgewichtig und datenschutzfreundlich aufgebaut.",
    sections: [
      {
        title: "Lokal gespeicherte Daten",
        bullets: [
          "Theme-Einstellung in localStorage.",
          "Sprache in localStorage und URL-Parametern.",
          "Favoriten lokal auf deinem Gerät."
        ]
      },
      {
        title: "Was wir nicht erfassen",
        bullets: [
          "Keine Konto-Registrierung erforderlich.",
          "Keine Profil-/Personendaten durch die App.",
          "Keine serverseitige Nutzerdatenbank."
        ]
      }
    ]
  },
  contact: {
    title: "Kontakt & Feedback",
    intro: "Feedback hilft, die Bibliothek nützlich und aktuell zu halten.",
    sections: [
      {
        title: "Probleme melden",
        paragraphs: ["Erstelle ein GitHub-Issue für Bugs, kaputte Links oder veraltete Einträge."]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "Rechtlicher Hinweis",
    intro: "Grundlegende Nutzungs- und Attributionstexte für dieses Projekt.",
    sections: [
      {
        title: "Nutzung",
        bullets: [
          "Diese Seite wird ohne Gewähr bereitgestellt.",
          "Nutzer sind für die Prüfung externer Ressourcen selbst verantwortlich."
        ]
      },
      {
        title: "Marken & Urheberrecht",
        bullets: [
          "Final Fantasy XIV und verwandte Namen sind Eigentum von Square Enix.",
          "Externe Guides und Ressourcen bleiben Eigentum der jeweiligen Inhaber."
        ]
      }
    ]
  }
};

const JA_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "XIV BiS Library について",
    intro: "XIV BiS Library は、Final Fantasy XIV のコミュニティBiSリンクをジョブ・ロール・コンテンツ種別で整理したサイトです。",
    sections: [
      {
        title: "このサイトの目的",
        bullets: [
          "信頼できるBiS情報に素早くアクセス。",
          "ロール・ジョブ・カテゴリ・コンテンツで絞り込み。",
          "絞り込み結果を共有し、お気に入り保存。"
        ]
      },
      {
        title: "メンテナンス",
        paragraphs: [
          "エントリはコミュニティ情報を確認したうえで更新しています。",
          "表示される更新日は最新データのデプロイ日時です。"
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "データソースと免責事項",
    intro: "本プロジェクトは外部コミュニティ情報を参照しており、常に完全な正確性を保証するものではありません。",
    sections: [
      {
        title: "ソース",
        bullets: [
          "リンクはコミュニティガイドやギアプランナーに基づきます。",
          "可能な場合、各行に元ソースを表示します。"
        ]
      },
      {
        title: "重要な注意",
        bullets: [
          "パッチやジョブ調整で情報が古くなる場合があります。",
          "最終的な判断前に元ソースを確認してください。",
          "本サイトはSquare Enix非公式のコミュニティプロジェクトです。"
        ]
      }
    ]
  },
  privacy: {
    title: "プライバシー",
    intro: "このサイトは軽量で、プライバシー配慮の設計です。",
    sections: [
      {
        title: "ローカル保存される情報",
        bullets: [
          "テーマ設定は localStorage に保存。",
          "言語設定は localStorage とURLに保存。",
          "お気に入りは端末内に保存。"
        ]
      },
      {
        title: "収集しない情報",
        bullets: [
          "アカウント登録は不要です。",
          "個人プロフィール情報は収集しません。",
          "サーバー側ユーザーデータベースは使用しません。"
        ]
      }
    ]
  },
  contact: {
    title: "お問い合わせ・フィードバック",
    intro: "フィードバックはサイト改善に役立ちます。",
    sections: [
      {
        title: "不具合報告",
        paragraphs: ["バグ・リンク切れ・古い情報はGitHub Issueで報告してください。"]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "法的表示",
    intro: "本プロジェクトの利用条件および権利表示です。",
    sections: [
      {
        title: "利用",
        bullets: [
          "本サイトは現状有姿で提供され、保証はありません。",
          "外部情報の確認は利用者の責任で行ってください。"
        ]
      },
      {
        title: "商標・著作権",
        bullets: [
          "Final Fantasy XIV および関連名称は Square Enix の財産です。",
          "外部ガイドやリンク先資産は各権利者に帰属します。"
        ]
      }
    ]
  }
};

const KO_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "XIV BiS Library 소개",
    intro: "XIV BiS Library는 Final Fantasy XIV 커뮤니티 BiS 링크를 직업, 역할, 콘텐츠 유형별로 정리해 제공합니다.",
    sections: [
      {
        title: "사이트 목적",
        bullets: [
          "신뢰할 수 있는 BiS 자료를 빠르게 찾기.",
          "역할/직업/카테고리/전투별 필터링.",
          "필터 결과 공유 및 즐겨찾기 저장."
        ]
      },
      {
        title: "유지보수",
        paragraphs: [
          "엔트리는 커뮤니티 자료를 검토한 뒤 업데이트됩니다.",
          "표시되는 날짜는 마지막 데이터 배포 기준입니다."
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "데이터 출처 및 고지",
    intro: "본 프로젝트는 외부 커뮤니티 자료를 참조하며 항상 완전한 정확성을 보장하지 않습니다.",
    sections: [
      {
        title: "출처",
        bullets: [
          "링크는 커뮤니티 가이드 및 장비 플래너 기반입니다.",
          "가능한 경우 각 행에 원본 출처를 표시합니다."
        ]
      },
      {
        title: "중요 고지",
        bullets: [
          "패치나 직업 변경으로 정보가 오래될 수 있습니다.",
          "최종 적용 전 반드시 원본 출처를 확인하세요.",
          "이 사이트는 Square Enix와 무관한 비공식 커뮤니티 프로젝트입니다."
        ]
      }
    ]
  },
  privacy: {
    title: "개인정보",
    intro: "이 사이트는 가볍고 개인정보 보호를 고려해 설계되었습니다.",
    sections: [
      {
        title: "로컬 저장 데이터",
        bullets: [
          "테마 설정은 localStorage에 저장됩니다.",
          "언어 설정은 localStorage 및 URL에 저장됩니다.",
          "즐겨찾기는 사용자 기기에 저장됩니다."
        ]
      },
      {
        title: "수집하지 않는 정보",
        bullets: [
          "계정 등록이 필요하지 않습니다.",
          "앱 자체는 개인 프로필 정보를 수집하지 않습니다.",
          "서버 측 사용자 DB를 사용하지 않습니다."
        ]
      }
    ]
  },
  contact: {
    title: "문의 및 피드백",
    intro: "피드백은 라이브러리를 유용하고 최신 상태로 유지하는 데 도움이 됩니다.",
    sections: [
      {
        title: "문제 제보",
        paragraphs: ["버그, 깨진 링크, 오래된 항목은 GitHub 이슈로 제보해 주세요."]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "법적 고지",
    intro: "본 프로젝트의 기본 이용 및 권리 표기입니다.",
    sections: [
      {
        title: "이용",
        bullets: [
          "이 사이트는 어떠한 보증 없이 현상태로 제공됩니다.",
          "외부 자료 검증 책임은 사용자에게 있습니다."
        ]
      },
      {
        title: "상표 및 저작권",
        bullets: [
          "Final Fantasy XIV 및 관련 명칭은 Square Enix의 자산입니다.",
          "외부 가이드 및 링크 리소스는 각 권리자 소유입니다."
        ]
      }
    ]
  }
};

const ZH_CN_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "关于 XIV BiS Library",
    intro: "XIV BiS Library 按职业、职责与内容类型集中整理 Final Fantasy XIV 社区 BiS 链接。",
    sections: [
      {
        title: "网站用途",
        bullets: [
          "快速找到可信的 BiS 资源。",
          "可按职责、职业、分类与副本筛选。",
          "分享筛选结果并保存收藏。"
        ]
      },
      {
        title: "维护",
        paragraphs: [
          "条目来自社区资源，经过维护者审查后更新。",
          "显示日期为最近一次数据部署时间。"
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "数据来源与声明",
    intro: "本项目引用外部社区资源，无法保证任何时间点都完全准确。",
    sections: [
      {
        title: "来源",
        bullets: [
          "链接来自社区指南与配装工具。",
          "在可用时，每一行会显示原始来源。"
        ]
      },
      {
        title: "重要声明",
        bullets: [
          "版本更新或职业改动后，条目可能过时。",
          "最终使用前请始终核对原始来源。",
          "本网站为独立社区项目，与 Square Enix 无关联。"
        ]
      }
    ]
  },
  privacy: {
    title: "隐私",
    intro: "本网站轻量并注重隐私。",
    sections: [
      {
        title: "本地存储的数据",
        bullets: [
          "主题偏好存储在 localStorage。",
          "语言偏好存储在 localStorage 与 URL 参数。",
          "收藏条目仅存储在你的设备上。"
        ]
      },
      {
        title: "我们不会收集",
        bullets: [
          "无需注册账号。",
          "应用本身不收集个人资料。",
          "不使用服务器端用户数据库。"
        ]
      }
    ]
  },
  contact: {
    title: "联系与反馈",
    intro: "你的反馈有助于保持站点实用且最新。",
    sections: [
      {
        title: "问题反馈",
        paragraphs: ["如有 bug、失效链接或过期条目，请在 GitHub 提交 issue。"]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "法律声明",
    intro: "本项目的基本使用与归属说明。",
    sections: [
      {
        title: "使用",
        bullets: [
          "本网站按现状提供，不附带任何保证。",
          "用户需自行核验外部资源。"
        ]
      },
      {
        title: "商标与版权",
        bullets: [
          "Final Fantasy XIV 及相关名称归 Square Enix 所有。",
          "外部指南与链接资源归其各自所有者所有。"
        ]
      }
    ]
  }
};

const ZH_TW_PAGES: Record<InfoPageKey, InfoPageContent> = {
  about: {
    title: "關於 XIV BiS Library",
    intro: "XIV BiS Library 依職業、職責與內容類型整理 Final Fantasy XIV 社群 BiS 連結。",
    sections: [
      {
        title: "網站用途",
        bullets: [
          "快速找到可信的 BiS 資源。",
          "可依職責、職業、分類與副本篩選。",
          "分享篩選結果並儲存收藏。"
        ]
      },
      {
        title: "維護",
        paragraphs: [
          "條目來自社群資源，經維護者檢查後更新。",
          "顯示日期為最近一次資料部署時間。"
        ]
      }
    ]
  },
  dataDisclaimer: {
    title: "資料來源與聲明",
    intro: "本專案引用外部社群資源，無法保證任何時間點都完全正確。",
    sections: [
      {
        title: "來源",
        bullets: [
          "連結來自社群指南與配裝工具。",
          "在可用時，每列會顯示原始來源。"
        ]
      },
      {
        title: "重要聲明",
        bullets: [
          "版本更新或職業調整後，資料可能過期。",
          "最終使用前請務必確認原始來源。",
          "本網站為獨立社群專案，與 Square Enix 無官方關係。"
        ]
      }
    ]
  },
  privacy: {
    title: "隱私",
    intro: "本網站輕量且重視隱私。",
    sections: [
      {
        title: "本機儲存資料",
        bullets: [
          "主題偏好儲存在 localStorage。",
          "語言偏好儲存在 localStorage 與 URL 參數。",
          "收藏條目僅儲存在你的裝置。"
        ]
      },
      {
        title: "我們不會收集",
        bullets: [
          "不需要帳號註冊。",
          "應用本身不會收集個人檔案資料。",
          "不使用伺服器端使用者資料庫。"
        ]
      }
    ]
  },
  contact: {
    title: "聯絡與回饋",
    intro: "你的回饋有助於讓資料庫保持實用且最新。",
    sections: [
      {
        title: "問題回報",
        paragraphs: ["若有 bug、失效連結或過期資料，請在 GitHub 建立 issue。"]
      },
      {
        title: "GitHub",
        paragraphs: ["https://github.com/MelkyWay/xiv-bis-library"]
      }
    ]
  },
  legal: {
    title: "法律聲明",
    intro: "本專案的基本使用與權利說明。",
    sections: [
      {
        title: "使用",
        bullets: [
          "本網站以現況提供，不提供任何保證。",
          "使用者需自行驗證外部資料。"
        ]
      },
      {
        title: "商標與版權",
        bullets: [
          "Final Fantasy XIV 與相關名稱屬於 Square Enix。",
          "外部指南與資源屬於其各自持有人。"
        ]
      }
    ]
  }
};

const baseByLocale: Record<SupportedLocale, InfoBundle> = {
  en: {
    close: "Close",
    ariaPanel: "Site information",
    ariaFooter: "Site pages",
    footer: { home: "Home", about: "About", dataDisclaimer: "Data & Disclaimer", privacy: "Privacy", contact: "Contact", legal: "Legal" },
    pages: EN_PAGES
  },
  fr: {
    close: "Fermer",
    ariaPanel: "Informations du site",
    ariaFooter: "Pages du site",
    footer: { home: "Accueil", about: "À propos", dataDisclaimer: "Données et avertissement", privacy: "Confidentialité", contact: "Contact", legal: "Mentions légales" },
    pages: FR_PAGES
  },
  de: {
    close: "Schließen",
    ariaPanel: "Seiteninformationen",
    ariaFooter: "Seiten",
    footer: { home: "Start", about: "Über", dataDisclaimer: "Daten & Hinweis", privacy: "Datenschutz", contact: "Kontakt", legal: "Rechtliches" },
    pages: DE_PAGES
  },
  ja: {
    close: "閉じる",
    ariaPanel: "サイト情報",
    ariaFooter: "サイトページ",
    footer: { home: "ホーム", about: "概要", dataDisclaimer: "データと免責", privacy: "プライバシー", contact: "連絡先", legal: "法的情報" },
    pages: JA_PAGES
  },
  ko: {
    close: "닫기",
    ariaPanel: "사이트 정보",
    ariaFooter: "사이트 페이지",
    footer: { home: "홈", about: "소개", dataDisclaimer: "데이터 및 고지", privacy: "개인정보", contact: "문의", legal: "법적 고지" },
    pages: KO_PAGES
  },
  "zh-CN": {
    close: "关闭",
    ariaPanel: "站点信息",
    ariaFooter: "站点页面",
    footer: { home: "首页", about: "关于", dataDisclaimer: "数据与声明", privacy: "隐私", contact: "联系", legal: "法律" },
    pages: ZH_CN_PAGES
  },
  "zh-TW": {
    close: "關閉",
    ariaPanel: "網站資訊",
    ariaFooter: "網站頁面",
    footer: { home: "首頁", about: "關於", dataDisclaimer: "資料與聲明", privacy: "隱私", contact: "聯絡", legal: "法律" },
    pages: ZH_TW_PAGES
  }
};

export const infoMessages: Record<SupportedLocale, { info: InfoBundle }> = Object.fromEntries(
  Object.entries(baseByLocale).map(([locale, info]) => [locale, { info }])
) as Record<SupportedLocale, { info: InfoBundle }>;
