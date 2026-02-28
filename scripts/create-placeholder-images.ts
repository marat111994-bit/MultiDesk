import * as fs from 'fs';
import * as path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Список всех путей к изображениям из кода
const imagePaths = [
  // Services
  '/images/services/vyvoz-grunta/hero.jpg',
  '/images/services/vyvoz-grunta/chistyj-grunt.jpg',
  '/images/services/vyvoz-grunta/tekhnogennyj-grunt.jpg',
  '/images/services/vyvoz-grunta/burovoj-shlam-gnb.jpg',
  '/images/services/vyvoz-grunta/zagryaznennyj-grunt.jpg',
  '/images/services/vyvoz-grunta/dorozhnyj-grunt.jpg',
  '/images/services/smeshannye-othody/hero.jpg',
  '/images/services/dokumentaciya/hero.jpg',
  '/images/services/dokumentaciya/biotestirovanie.jpg',
  '/images/services/dokumentaciya/pasport.jpg',
  '/images/services/dokumentaciya/razreshenije.jpg',
  '/images/services/kirpichnyj-boj/hero.jpg',
  '/images/services/kirpichnyj-boj/stroitelnyj.jpg',
  '/images/services/kirpichnyj-boj/ogneupornyj.jpg',
  '/images/services/betonnyj-boj/hero.jpg',
  '/images/services/betonnyj-boj/lom-betona.jpg',
  '/images/services/betonnyj-boj/othody-snosa.jpg',
  '/images/services/betonnyj-boj/shpaly.jpg',
  '/images/services/betonnyj-boj/smesi.jpg',
  '/images/services/asfaltnyj-boj/hero.jpg',
  
  // Why-us
  '/images/why-us/vyvoz-grunta.jpg',
  '/images/why-us/burovoj-shlam-gnb.jpg',
  '/images/why-us/asfaltnyj-boj.jpg',
  '/images/why-us/home.jpg',
  '/images/why-us/smeshannye-othody.jpg',
  '/images/why-us/razreshenije.jpg',
  '/images/why-us/stroitelnyj-kirpichnyj-boj.jpg',
  '/images/why-us/pasport-othodov.jpg',
  '/images/why-us/kirpichnyj-boj.jpg',
  '/images/why-us/dokumentaciya.jpg',
  '/images/why-us/ogneupornyj-kirpich.jpg',
  '/images/why-us/biotestirovanie.jpg',
  '/images/why-us/shpaly.jpg',
  '/images/why-us/betonnyj-boj.jpg',
  '/images/why-us/othody-snosa.jpg',
  '/images/why-us/lom-betona.jpg',
  '/images/why-us/smesi.jpg',
  
  // Cases
  '/images/cases/zhk-serdce-stolitsy.jpg',
  '/images/cases/kirpichnyj-boj-zavod.jpg',
  '/images/cases/betonnyj-boj-tc.jpg',
  '/images/cases/azs-khimki.jpg',
  '/images/cases/asfalt-shosse.jpg',
  
  // Clients
  '/images/clients/pik.svg',
  '/images/clients/donstroy.svg',
  '/images/clients/samolet.svg',
  '/images/clients/pik-comfort.svg',
  '/images/clients/mr-group.svg',
  '/images/clients/glavstroy.svg',
  '/images/clients/ingrad.svg',
  '/images/clients/absolut.svg',
  
  // O kompanii
  '/images/o-kompanii/hero.jpg',
  '/images/o-kompanii/team.jpg',
  
  // Placeholders
  '/images/placeholder.svg',
  '/images/placeholder-hero.svg',
  '/images/placeholder-case.svg',
  '/images/placeholder-blog.svg',
  '/images/placeholder-client.svg',
  '/images/logo.svg',
];

function createSvgPlaceholder(width: number, height: number, text: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect fill="#e2e8f0" width="${width}" height="${height}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.max(24, width / 30)}" fill="#94a3b8" text-anchor="middle" dy=".3em">${text}</text>
</svg>
`;
}

function createLogoPlaceholder(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60" viewBox="0 0 200 60">
  <rect fill="#1e293b" width="200" height="60" rx="8"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" dy=".3em">DanMax</text>
</svg>
`;
}

function createClientPlaceholder(name: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80">
  <rect fill="#f1f5f9" width="200" height="80" rx="8"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18" fill="#64748b" text-anchor="middle" dy=".3em">${name}</text>
</svg>
`;
}

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createPlaceholder(filePath: string) {
  const fullPath = path.join(PUBLIC_DIR, filePath);
  const dir = path.dirname(fullPath);
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath).toLowerCase();
  
  ensureDir(dir);
  
  // Skip if already exists
  if (fs.existsSync(fullPath)) {
    console.log(`✓ Уже существует: ${filePath}`);
    return;
  }
  
  let svgContent: string;
  
  // Определяем тип заглушки по пути
  const lowerPath = filePath.toLowerCase();
  
  if (lowerPath.includes('logo')) {
    svgContent = createLogoPlaceholder();
  } else if (lowerPath.includes('client')) {
    // Извлекаем имя клиента из пути
    const clientName = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
    svgContent = createClientPlaceholder(clientName);
  } else if (lowerPath.includes('hero')) {
    svgContent = createSvgPlaceholder(1920, 1080, 'Hero Image');
  } else if (lowerPath.includes('case')) {
    svgContent = createSvgPlaceholder(640, 480, 'Case Image');
  } else if (lowerPath.includes('blog')) {
    svgContent = createSvgPlaceholder(1200, 630, 'Blog Image');
  } else if (lowerPath.includes('placeholder')) {
    if (lowerPath.includes('hero')) {
      svgContent = createSvgPlaceholder(1920, 1080, 'Placeholder Hero');
    } else if (lowerPath.includes('case')) {
      svgContent = createSvgPlaceholder(640, 480, 'Placeholder Case');
    } else if (lowerPath.includes('blog')) {
      svgContent = createSvgPlaceholder(1200, 630, 'Placeholder Blog');
    } else if (lowerPath.includes('client')) {
      svgContent = createSvgPlaceholder(200, 80, 'Placeholder Client');
    } else {
      svgContent = createSvgPlaceholder(800, 600, 'Placeholder');
    }
  } else {
    // Для всех остальных - стандартная заглушка 800x600
    const labelText = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase();
    svgContent = createSvgPlaceholder(800, 600, labelText);
  }
  
  // Для .jpg файлов создаём SVG (Next.js может отображать SVG даже с расширением .jpg через Image)
  // Но лучше создать реальный PNG или оставить SVG с правильным расширением
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
    // Создаём SVG файл вместо растрового формата
    const svgPath = fullPath.replace(/\.(jpg|jpeg|png)$/i, '.svg');
    fs.writeFileSync(svgPath, svgContent, 'utf-8');
    console.log(`✓ Создано: ${filePath.replace(/\.(jpg|jpeg|png)$/i, '.svg')}`);
  } else {
    fs.writeFileSync(fullPath, svgContent, 'utf-8');
    console.log(`✓ Создано: ${filePath}`);
  }
}

// Main
console.log('🚀 Создание заглушек для изображений...\n');

imagePaths.forEach(createPlaceholder);

console.log('\n✅ Готово! Все заглушки созданы в public/images/');
