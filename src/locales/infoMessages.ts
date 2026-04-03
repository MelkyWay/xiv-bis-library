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
          "Links and references are sourced from community-maintained guides and gear planners.",
          "Each row includes a source field to show the original provider when available."
        ]
      },
      {
        title: "Important Disclaimer",
        bullets: [
          "Entries may become outdated after game patches, job changes, or guide revisions.",
          "Always verify details against the original source before finalizing your setup.",
          "This site is an independent community project and is not affiliated with or endorsed by Square Enix."
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
          "Theme preference is stored in localStorage.",
          "Language preference is stored in localStorage and URL parameters.",
          "Favorite entries are stored in localStorage on your device."
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
    pages: EN_PAGES
  },
  de: {
    close: "Schließen",
    ariaPanel: "Seiteninformationen",
    ariaFooter: "Seiten",
    footer: { home: "Start", about: "Über", dataDisclaimer: "Daten & Hinweis", privacy: "Datenschutz", contact: "Kontakt", legal: "Rechtliches" },
    pages: EN_PAGES
  },
  ja: {
    close: "閉じる",
    ariaPanel: "サイト情報",
    ariaFooter: "サイトページ",
    footer: { home: "ホーム", about: "概要", dataDisclaimer: "データと免責", privacy: "プライバシー", contact: "連絡先", legal: "法的情報" },
    pages: EN_PAGES
  },
  ko: {
    close: "닫기",
    ariaPanel: "사이트 정보",
    ariaFooter: "사이트 페이지",
    footer: { home: "홈", about: "소개", dataDisclaimer: "데이터 및 고지", privacy: "개인정보", contact: "문의", legal: "법적 고지" },
    pages: EN_PAGES
  },
  "zh-CN": {
    close: "关闭",
    ariaPanel: "站点信息",
    ariaFooter: "站点页面",
    footer: { home: "首页", about: "关于", dataDisclaimer: "数据与声明", privacy: "隐私", contact: "联系", legal: "法律" },
    pages: EN_PAGES
  },
  "zh-TW": {
    close: "關閉",
    ariaPanel: "網站資訊",
    ariaFooter: "網站頁面",
    footer: { home: "首頁", about: "關於", dataDisclaimer: "資料與聲明", privacy: "隱私", contact: "聯絡", legal: "法律" },
    pages: EN_PAGES
  }
};

export const infoMessages: Record<SupportedLocale, { info: InfoBundle }> = Object.fromEntries(
  Object.entries(baseByLocale).map(([locale, info]) => [locale, { info }])
) as Record<SupportedLocale, { info: InfoBundle }>;
