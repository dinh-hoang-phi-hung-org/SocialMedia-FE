module.exports = {
  i18n: {
    defaultLocale: "en",
    locales: ["en", "vi"],
    localeDetection: false,
  },
  defaultNS: "common",
  localePath: "./public/locales",
  reloadOnPrerender: process.env.NODE_ENV === "development",
};

