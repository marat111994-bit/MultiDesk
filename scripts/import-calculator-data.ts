import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

interface ImportStats {
  imported: number;
  errors: number;
}

interface ImportResult {
  name: string;
  stats: ImportStats;
}

/**
 * Парсит CSV файл и возвращает массив записей
 */
function parseCsvFile(filePath: string): Record<string, string>[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

/**
 * Импортирует категории грузов из CSV
 */
async function importCargoCategories(dataDir: string): Promise<ImportStats> {
  const stats: ImportStats = { imported: 0, errors: 0 };
  const filePath = path.join(dataDir, 'categories.csv');

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Файл не найден: ${filePath}`);
    return stats;
  }

  const records = parseCsvFile(filePath);

  for (const record of records) {
    try {
      await prisma.cargoCategory.upsert({
        where: { categoryCode: record.category_code },
        update: {
          name: record.name,
        },
        create: {
          categoryCode: record.category_code,
          name: record.name,
        },
      });
      stats.imported++;
    } catch (error) {
      stats.errors++;
      console.error(`Ошибка импорта категории ${record.category_code}:`, error);
    }
  }

  return stats;
}

/**
 * Импортирует номенклатуру грузов из CSV и добавляет INERT-элементы
 */
async function importCargoItems(dataDir: string): Promise<ImportStats> {
  const stats: ImportStats = { imported: 0, errors: 0 };
  const filePath = path.join(dataDir, 'cargo_items.csv');

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Файл не найден: ${filePath}`);
    return stats;
  }

  const records = parseCsvFile(filePath);

  for (const record of records) {
    try {
      await prisma.cargoItem.upsert({
        where: { itemCode: record.item_code },
        update: {
          categoryCode: record.category_code,
          itemName: record.item_name,
          fkkoCode: record.fkko_code || null,
          hazardClass: record.hazard_class ? parseInt(record.hazard_class, 10) : null,
        },
        create: {
          itemCode: record.item_code,
          categoryCode: record.category_code,
          itemName: record.item_name,
          fkkoCode: record.fkko_code || null,
          hazardClass: record.hazard_class ? parseInt(record.hazard_class, 10) : null,
        },
      });
      stats.imported++;
    } catch (error) {
      stats.errors++;
      console.error(`Ошибка импорта груза ${record.item_code}:`, error);
    }
  }

  // Добавляем INERT-элементы вручную
  const inertItems = [
    { itemCode: 'SAND', categoryCode: 'INERT', itemName: 'Песок' },
    { itemCode: 'GRAVEL', categoryCode: 'INERT', itemName: 'Щебень' },
  ];

  for (const item of inertItems) {
    try {
      await prisma.cargoItem.upsert({
        where: { itemCode: item.itemCode },
        update: {
          categoryCode: item.categoryCode,
          itemName: item.itemName,
        },
        create: {
          itemCode: item.itemCode,
          categoryCode: item.categoryCode,
          itemName: item.itemName,
          fkkoCode: null,
          hazardClass: null,
        },
      });
      stats.imported++;
    } catch (error) {
      stats.errors++;
      console.error(`Ошибка импорта INERT-элемента ${item.itemCode}:`, error);
    }
  }

  return stats;
}

/**
 * Импортирует полигоны из CSV
 */
async function importPolygons(dataDir: string): Promise<ImportStats> {
  const stats: ImportStats = { imported: 0, errors: 0 };
  const filePath = path.join(dataDir, 'polygons.csv');

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Файл не найден: ${filePath}`);
    return stats;
  }

  const records = parseCsvFile(filePath);

  for (const record of records) {
    try {
      await prisma.polygon.upsert({
        where: { polygonId: record.polygon_id },
        update: {
          seqNo: record.seq_no ? parseInt(record.seq_no, 10) : null,
          receiverName: record.receiver_name,
          receiverInn: record.receiver_inn || null,
          facilityAddress: record.facility_address,
          facilityCoordinates: record.facility_coordinates || null,
          region: record.region || null,
          phone: record.phone || null,
          email: record.email || null,
          kipNumber: record.kip_number || null,
          fkkoCodes: record.fkko_code || null,
          isActive: record.is_active === 'true' || record.is_active === '1' || record.is_active === 'TRUE',
        },
        create: {
          polygonId: record.polygon_id,
          seqNo: record.seq_no ? parseInt(record.seq_no, 10) : null,
          receiverName: record.receiver_name,
          receiverInn: record.receiver_inn || null,
          facilityAddress: record.facility_address,
          facilityCoordinates: record.facility_coordinates || null,
          region: record.region || null,
          phone: record.phone || null,
          email: record.email || null,
          kipNumber: record.kip_number || null,
          fkkoCodes: record.fkko_code || null,
          isActive: record.is_active === 'true' || record.is_active === '1' || record.is_active === 'TRUE',
        },
      });
      stats.imported++;
    } catch (error) {
      stats.errors++;
      console.error(`Ошибка импорта полигона ${record.polygon_id}:`, error);
    }
  }

  return stats;
}

/**
 * Импортирует тарифы утилизации из CSV батчами по 500 записей
 */
async function importUtilizationTariffs(dataDir: string): Promise<ImportStats> {
  const stats: ImportStats = { imported: 0, errors: 0 };
  const filePath = path.join(dataDir, 'utilization_tariffs.csv');

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠ Файл не найден: ${filePath}`);
    return stats;
  }

  const records = parseCsvFile(filePath);
  const batchSize = 500;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const batchPromises = batch.map(async (record) => {
      try {
        await prisma.utilizationTariff.upsert({
          where: {
            fkkoCode_polygonId: {
              fkkoCode: record.fkko_code,
              polygonId: record.polygon_id,
            },
          },
          update: {
            tariffRubT: parseFloat(record.tariff_rub_t),
          },
          create: {
            fkkoCode: record.fkko_code,
            polygonId: record.polygon_id,
            tariffRubT: parseFloat(record.tariff_rub_t),
          },
        });
        stats.imported++;
      } catch (error) {
        stats.errors++;
        console.error(`Ошибка импорта тарифа ${record.fkko_code}/${record.polygon_id}:`, error);
      }
    });

    await Promise.all(batchPromises);
    console.log(`  Обработано ${Math.min(i + batchSize, records.length)} из ${records.length} записей...`);
  }

  return stats;
}

/**
 * Создаёт начальную конфигурацию тарифов перевозки (singleton)
 */
async function createTransportTariffConfig(): Promise<ImportStats> {
  const stats: ImportStats = { imported: 0, errors: 0 };

  try {
    await prisma.transportTariffConfig.upsert({
      where: { id: 1 },
      update: {
        startKm: 1,
        startTariff: 18.0,
        endKm: 10,
        endTariff: 18.0,
        volumeCoeff: 1.4,
        marginPercent: 0,
        maxDistanceKm: 500,
      },
      create: {
        id: 1,
        startKm: 1,
        startTariff: 18.0,
        endKm: 10,
        endTariff: 18.0,
        volumeCoeff: 1.4,
        marginPercent: 0,
        maxDistanceKm: 500,
        point1Km: 1,
        point1Tariff: 18.0,
        point2Km: 10,
        point2Tariff: 18.0,
        point3Km: 10,
        point3Tariff: 18.0,
      },
    });
    stats.imported++;
  } catch (error) {
    stats.errors++;
    console.error('Ошибка создания конфигурации тарифов:', error);
  }

  return stats;
}

/**
 * Основная функция импорта
 */
async function main() {
  const dataDir = process.argv[2];

  if (!dataDir) {
    console.error('❌ Укажите путь к папке с CSV-файлами');
    console.error('Использование: ts-node scripts/import-calculator-data.ts ./data');
    process.exit(1);
  }

  const absoluteDataDir = path.resolve(dataDir);

  if (!fs.existsSync(absoluteDataDir)) {
    console.error(`❌ Папка с данными не найдена: ${absoluteDataDir}`);
    process.exit(1);
  }

  console.log('🚀 Запуск импорта данных калькулятора...\n');

  const results: ImportResult[] = [];

  // [1/5] Импорт категорий
  console.log('[1/5] Импорт категорий...');
  const categoriesStats = await importCargoCategories(absoluteDataDir);
  results.push({ name: 'CargoCategory', stats: categoriesStats });
  console.log(`✅ OK (${categoriesStats.imported} записей)${categoriesStats.errors > 0 ? `, ${categoriesStats.errors} ошибок` : ''}\n`);

  // [2/5] Импорт номенклатуры грузов
  console.log('[2/5] Импорт номенклатуры грузов...');
  const cargoItemsStats = await importCargoItems(absoluteDataDir);
  results.push({ name: 'CargoItem', stats: cargoItemsStats });
  console.log(`✅ OK (${cargoItemsStats.imported} записей)${cargoItemsStats.errors > 0 ? `, ${cargoItemsStats.errors} ошибок` : ''}\n`);

  // [3/5] Импорт полигонов
  console.log('[3/5] Импорт полигонов...');
  const polygonsStats = await importPolygons(absoluteDataDir);
  results.push({ name: 'Polygon', stats: polygonsStats });
  console.log(`✅ OK (${polygonsStats.imported} записей)${polygonsStats.errors > 0 ? `, ${polygonsStats.errors} ошибок` : ''}\n`);

  // [4/5] Импорт тарифов утилизации
  console.log('[4/5] Импорт тарифов утилизации...');
  const utilizationTariffsStats = await importUtilizationTariffs(absoluteDataDir);
  results.push({ name: 'UtilizationTariff', stats: utilizationTariffsStats });
  console.log(`✅ OK (${utilizationTariffsStats.imported} записей)${utilizationTariffsStats.errors > 0 ? `, ${utilizationTariffsStats.errors} ошибок` : ''}\n`);

  // [5/5] Создание конфигурации тарифов перевозки
  console.log('[5/5] Создание конфигурации тарифов перевозки...');
  const configStats = await createTransportTariffConfig();
  results.push({ name: 'TransportTariffConfig', stats: configStats });
  console.log(`✅ OK (${configStats.imported} записей)${configStats.errors > 0 ? `, ${configStats.errors} ошибок` : ''}\n`);

  // Сводка
  console.log('═══════════════════════════════════════════════════');
  console.log('📊 СВОДКА ИМПОРТА');
  console.log('═══════════════════════════════════════════════════');

  let totalImported = 0;
  let totalErrors = 0;

  for (const result of results) {
    console.log(`${result.name}:`);
    console.log(`  Импортировано: ${result.stats.imported}`);
    console.log(`  Ошибки: ${result.stats.errors}`);
    totalImported += result.stats.imported;
    totalErrors += result.stats.errors;
  }

  console.log('───────────────────────────────────────────────────');
  console.log(`ВСЕГО: ${totalImported} записей импортировано, ${totalErrors} ошибок`);
  console.log('═══════════════════════════════════════════════════');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
