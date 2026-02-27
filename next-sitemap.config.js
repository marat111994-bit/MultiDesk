/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://danmax.moscow",
  generateRobotsTxt: true,
  exclude: ["/_next/*", "/api/*"],
  priority: 1.0,
  changefreq: "daily",
  
  // Transform для разных типов страниц
  transform: async (config, path) => {
    // Главная
    if (path === "/") {
      return {
        loc: path,
        changefreq: config.changefreq,
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Услуги (основные)
    if (path.startsWith("/uslugi/") && path.split("/").length === 3) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 1.0,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Подкатегории услуг
    if (path.startsWith("/uslugi/") && path.split("/").length > 3) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Блог
    if (path.startsWith("/blog/") && path !== "/blog/") {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.6,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Калькулятор
    if (path === "/calculator/") {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.9,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // Служебные страницы
    if (["/o-kompanii/", "/kontakty/", "/politika-konfidencialnosti/"].includes(path)) {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.4,
        lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      };
    }
    
    // По умолчанию
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: 0.5,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
    ],
    additionalSitemaps: [
      "https://danmax.moscow/sitemap.xml",
    ],
  },
};
