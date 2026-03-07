/**
 * Тест генерации PDF
 */
import { generatePdf } from './src/lib/pdf/pdf-generator';
import { PdfTransportData, PdfDisposalData } from './src/lib/pdf/types';

// Тест 1: Перевозка
const transportData: PdfTransportData = {
  type: 'transport',
  applicationNumber: 'CD-070326-027',
  date: new Date().toISOString(),
  cargo: {
    name: 'грунт, образовавшийся при проведении землеройных работ, не загрязненный опасными веществами',
    fkkoCode: '81110001495',
    volume: 1000,
    unit: 'т',
    compactionCoefficient: 1.5,
  },
  route: {
    loadingAddress: 'Каштановая ул., 12, Одинцово, Московская обл.',
    unloadingAddress: 'Подольск, ул. Складская, д. 5',
    distance: 80,
  },
  pricing: {
    tariffPerTKm: 11,
    tariffPerT: 880, // 11 × 80
    totalCost: 853208,
  },
};

// Тест 2: Перевозка + утилизация
const disposalData: PdfDisposalData = {
  type: 'transport-disposal',
  applicationNumber: 'CD-070326-028',
  date: new Date().toISOString(),
  cargo: {
    name: 'шламы буровые при горизонтальном, наклонно-направленном бурении с применением бурового раствора глинистого на водной основе практически неопасные',
    fkkoCode: '1111111111',
    volume: 1000,
    unit: 'т',
    compactionCoefficient: 1.4,
  },
  route: {
    loadingAddress: 'Москва, пр-кт. Кутузовский, 10',
    polygonName: 'Полигон ТБО "Алексинский"',
    polygonAddress: 'МО, Серпуховский р-н, д. Алексинка',
    distance: 55,
  },
  pricing: {
    transport: {
      tariffPerTKm: 12,
      tariffPerT: 660, // 12 × 55
      cost: 643785,
    },
    disposal: {
      tariffPerT: 290,
      cost: 290000,
    },
    totalCost: 933785,
  },
};

async function test() {
  try {
    console.log('[TEST] Начало генерации PDF (Перевозка)...');
    const buffer1 = await generatePdf(transportData);
    console.log(`[TEST] PDF "Перевозка" сгенерирован успешно! Размер: ${(buffer1.length / 1024).toFixed(2)} КБ`);

    console.log('[TEST] Начало генерации PDF (Перевозка + утилизация)...');
    const buffer2 = await generatePdf(disposalData);
    console.log(`[TEST] PDF "Перевозка + утилизация" сгенерирован успешно! Размер: ${(buffer2.length / 1024).toFixed(2)} КБ`);

    // Сохраняем в файл
    const fs = await import('fs');
    const path = await import('path');
    const outputDir = path.join(process.cwd(), 'tmp', 'pdf');

    await fs.promises.mkdir(outputDir, { recursive: true });
    
    const outputPath1 = path.join(outputDir, 'test-transport.pdf');
    const outputPath2 = path.join(outputDir, 'test-disposal.pdf');
    
    await fs.promises.writeFile(outputPath1, buffer1);
    await fs.promises.writeFile(outputPath2, buffer2);

    console.log(`[TEST] Файлы сохранены:`);
    console.log(`  - ${outputPath1}`);
    console.log(`  - ${outputPath2}`);
  } catch (error) {
    console.error('[TEST] Ошибка:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

test();
