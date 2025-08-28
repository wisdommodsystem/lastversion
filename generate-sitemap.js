const fs = require('fs');
const path = require('path');
require('dotenv').config();

// قراءة الدومين من متغيرات البيئة
const domain = process.env.DOMAIN || 'https://YOUR_DOMAIN';

// تاريخ آخر تعديل (يمكن تحديثه تلقائياً)
const lastmod = new Date().toISOString().split('T')[0];

// محتوى sitemap.xml
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- تم توليد هذا الملف تلقائياً من ${domain} -->
  <url>
    <loc>${domain}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${domain}/statistics.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${domain}/#videos</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${domain}/#about</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${domain}/#privacy</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;

// كتابة الملف
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemapContent, 'utf8');

console.log(`✅ تم توليد sitemap.xml بنجاح للدومين: ${domain}`);
console.log(`📅 تاريخ آخر تعديل: ${lastmod}`);