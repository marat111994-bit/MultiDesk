import { Calculation } from '@prisma/client';

interface PdfData {
  calculationId: string;
  createdAt: string;
  serviceType: string;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  companyName?: string | null;
  companyInn?: string | null;
  cargoName?: string | null;
  fkkoCode?: string | null;
  volume?: number | null;
  unit?: string | null;
  pickupAddress?: string | null;
  dropoffAddress?: string | null;
  polygonName?: string | null;
  polygonAddress?: string | null;
  polygonCoords?: string | null;
  distanceKm?: number | null;
  transportTariff?: number | null;
  transportTariffPerKm?: number | null;
  transportPrice?: number | null;
  utilizationTariff?: number | null;
  utilizationPrice?: number | null;
  totalPrice?: number | null;
}

/**
 * Форматирование числа в рубли
 */
function formatRubles(value: number | null | undefined): string {
  if (value == null) return '0 ₽';
  return `${Math.round(value).toLocaleString('ru-RU')} ₽`;
}

/**
 * Форматирование даты
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Генерация QR-кода через Google Charts API для Яндекс.Карт
 */
function generateYandexMapsQr(coords?: string | null): string | null {
  if (!coords) return null;
  
  const parts = coords.split(',');
  if (parts.length < 2) return null;
  
  const lat = parts[0].trim();
  const lon = parts[1].trim();
  
  // Ссылка на Яндекс.Карты
  const yandexMapsUrl = `https://yandex.ru/maps/?pt=${lon},${lat}&z=15&l=map`;
  
  // Google Charts API для QR-кода
  return `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(yandexMapsUrl)}&choe=UTF-8`;
}

/**
 * Генерация HTML для коммерческого предложения
 */
export function generateCommercialOfferHtml(data: PdfData, isPreview = false): string {
  const qrCodeUrl = generateYandexMapsQr(data.polygonCoords);
  const hasDisposal = data.serviceType.includes('disposal');
  const volumeText = data.volume ? `${data.volume} ${data.unit || 'т'}` : '—';
  const volumeNum = data.volume || 0;
  
  // Расчёт тарифов
  const transportTariffPerKm = data.distanceKm && data.transportTariff 
    ? (data.transportTariff / data.distanceKm).toFixed(2)
    : '0';
  
  const disposalTariff = data.utilizationTariff?.toFixed(2) || '0';

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Коммерческое предложение №${data.calculationId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background: #fff;
      padding: 20mm;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 15px;
      margin-bottom: 25px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: bold;
      color: #2563eb;
      letter-spacing: 2px;
    }
    
    .logo-subtext {
      font-size: 12px;
      color: #666;
      margin-top: -5px;
    }
    
    .title-block {
      text-align: right;
    }
    
    .title {
      font-size: 22px;
      font-weight: bold;
      color: #1e40af;
      text-transform: uppercase;
    }
    
    .doc-number {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
    }
    
    .section {
      margin-bottom: 20px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      border-bottom: 1px solid #ddd;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .info-row {
      display: flex;
      gap: 10px;
    }
    
    .info-label {
      font-weight: 600;
      color: #555;
      min-width: 140px;
    }
    
    .info-value {
      color: #333;
    }
    
    .route-block {
      background: #f8fafc;
      padding: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    
    .route-row {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 10px;
    }
    
    .route-row:last-child {
      margin-bottom: 0;
    }
    
    .route-point {
      flex: 1;
    }
    
    .route-point-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    
    .route-point-value {
      font-weight: 500;
      color: #333;
    }
    
    .route-arrow {
      font-size: 24px;
      color: #2563eb;
    }
    
    .distance-badge {
      display: inline-block;
      background: #2563eb;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-top: 10px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    
    th, td {
      border: 1px solid #ddd;
      padding: 12px 10px;
      text-align: left;
    }
    
    th {
      background: #1e40af;
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .total-row {
      background: #1e40af !important;
      color: white;
      font-weight: bold;
      font-size: 16px;
    }
    
    .total-row td {
      border-color: #1e40af;
    }
    
    .text-right {
      text-align: right;
    }
    
    .conditions {
      background: #fef3c7;
      border: 1px solid #f59e0b;
      border-radius: 8px;
      padding: 12px 15px;
      margin: 20px 0;
      font-size: 13px;
      color: #92400e;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .signature {
      font-size: 15px;
    }
    
    .signature-name {
      font-weight: 600;
      color: #1e40af;
      margin-top: 5px;
    }
    
    .signature-contacts {
      font-size: 13px;
      color: #666;
      margin-top: 5px;
    }
    
    .qr-block {
      text-align: center;
    }
    
    .qr-label {
      font-size: 11px;
      color: #666;
      margin-top: 8px;
    }
    
    .qr-code {
      width: 100px;
      height: 100px;
      border: 1px solid #ddd;
    }
    
    @media print {
      body {
        padding: 10mm;
      }
      
      .no-print {
        display: none;
      }
    }
    
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
      z-index: 1000;
    }
    
    .print-btn:hover {
      background: #1d4ed8;
    }
  </style>
</head>
<body>
  ${isPreview ? '<button class="print-btn no-print" onclick="window.print()">🖨️ Распечатать</button>' : ''}
  
  <div class="header">
    <div class="logo">
      <div>
        <div class="logo-text">DanMax</div>
        <div class="logo-subtext">Вывоз и утилизация отходов</div>
      </div>
    </div>
    <div class="title-block">
      <div class="title">Коммерческое предложение</div>
      <div class="doc-number">№ ${data.calculationId}</div>
    </div>
  </div>
  
  <div class="section">
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Дата создания:</span>
        <span class="info-value">${formatDate(data.createdAt)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Тип услуги:</span>
        <span class="info-value">${getServiceTypeName(data.serviceType)}</span>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">📋 Получатель</div>
    <div class="info-grid">
      ${data.companyName ? `
      <div class="info-row">
        <span class="info-label">Компания:</span>
        <span class="info-value">${data.companyName}</span>
      </div>
      ` : ''}
      ${data.companyInn ? `
      <div class="info-row">
        <span class="info-label">ИНН:</span>
        <span class="info-value">${data.companyInn}</span>
      </div>
      ` : ''}
      ${data.contactName ? `
      <div class="info-row">
        <span class="info-label">Контактное лицо:</span>
        <span class="info-value">${data.contactName}</span>
      </div>
      ` : ''}
      ${data.contactPhone ? `
      <div class="info-row">
        <span class="info-label">Телефон:</span>
        <span class="info-value">${data.contactPhone}</span>
      </div>
      ` : ''}
      ${data.contactEmail ? `
      <div class="info-row">
        <span class="info-label">Email:</span>
        <span class="info-value">${data.contactEmail}</span>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">🚛 Услуга</div>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Тип услуги:</span>
        <span class="info-value">${getServiceTypeName(data.serviceType)}</span>
      </div>
      ${data.cargoName ? `
      <div class="info-row">
        <span class="info-label">Описание маршрута:</span>
        <span class="info-value">${data.cargoName}</span>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">📦 Груз</div>
    <div class="info-grid">
      ${data.cargoName ? `
      <div class="info-row">
        <span class="info-label">Наименование:</span>
        <span class="info-value">${data.cargoName}</span>
      </div>
      ` : ''}
      ${data.fkkoCode ? `
      <div class="info-row">
        <span class="info-label">ФККО:</span>
        <span class="info-value">${data.fkkoCode}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="info-label">Объём:</span>
        <span class="info-value">${volumeText}</span>
      </div>
      ${data.unit === 'т' ? `
      <div class="info-row">
        <span class="info-label">Класс опасности:</span>
        <span class="info-value">${getHazardClass(data.fkkoCode)}</span>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">🗺️ Маршрут</div>
    <div class="route-block">
      <div class="route-row">
        <div class="route-point">
          <div class="route-point-label">Погрузка</div>
          <div class="route-point-value">${data.pickupAddress || '—'}</div>
        </div>
        <div class="route-arrow">→</div>
        <div class="route-point">
          <div class="route-point-label">Выгрузка${data.polygonName ? ` (${data.polygonName})` : ''}</div>
          <div class="route-point-value">${data.dropoffAddress || data.polygonAddress || '—'}</div>
        </div>
      </div>
      ${data.distanceKm ? `
      <div class="distance-badge">📍 Расстояние: ${Math.round(data.distanceKm)} км</div>
      ` : ''}
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">💰 Стоимость</div>
    <table>
      <thead>
        <tr>
          <th style="width: 40%;">Услуга</th>
          <th style="width: 20%;">Объём</th>
          <th style="width: 20%;">Тариф</th>
          <th style="width: 20%;" class="text-right">Стоимость</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Перевозка</td>
          <td>${volumeText}</td>
          <td>${formatRubles(data.transportTariffPerKm ? parseFloat(transportTariffPerKm) : 0)}/т·км</td>
          <td class="text-right">${formatRubles(data.transportPrice)}</td>
        </tr>
        ${hasDisposal ? `
        <tr>
          <td>Утилизация</td>
          <td>${volumeText}</td>
          <td>${formatRubles(parseFloat(disposalTariff))}/т</td>
          <td class="text-right">${formatRubles(data.utilizationPrice)}</td>
        </tr>
        ` : ''}
        <tr class="total-row">
          <td colspan="3" class="text-right">ИТОГО:</td>
          <td class="text-right">${formatRubles(data.totalPrice)}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="conditions">
    ⏱️ <strong>Действует 5 рабочих дней с даты выдачи</strong>
  </div>
  
  <div class="footer">
    <div class="signature">
      <div>С уважением, команда</div>
      <div class="signature-name">DanMax</div>
      <div class="signature-contacts">
        📞 ${process.env.COMPANY_PHONE || '+7 (XXX) XXX-XX-XX'} | 
        ✉️ ${process.env.COMPANY_EMAIL || 'info@danmax.ru'}
      </div>
    </div>
    ${qrCodeUrl ? `
    <div class="qr-block">
      <img src="${qrCodeUrl}" alt="QR код" class="qr-code" />
      <div class="qr-label">Полигон на карте</div>
    </div>
    ` : ''}
  </div>
</body>
</html>`;

  return html;
}

/**
 * Получение названия типа услуги
 */
function getServiceTypeName(serviceType: string): string {
  const types: Record<string, string> = {
    'transport': 'Перевозка',
    'transport_disposal_auto': 'Перевозка с утилизацией (автоматически)',
    'transport_disposal_manual': 'Перевозка с утилизацией (вручную)',
  };
  return types[serviceType] || serviceType;
}

/**
 * Определение класса опасности по ФККО
 */
function getHazardClass(fkkoCode?: string | null): string {
  if (!fkkoCode || fkkoCode.length < 11) return '—';
  
  const hazardClassDigit = fkkoCode[10];
  const classes: Record<string, string> = {
    '1': 'I (Чрезвычайно опасные)',
    '2': 'II (Высокоопасные)',
    '3': 'III (Умеренно опасные)',
    '4': 'IV (Малоопасные)',
    '5': 'V (Практически неопасные)',
  };
  
  return classes[hazardClassDigit] || '—';
}

/**
 * Генерация PDF через Puppeteer (если доступен)
 */
export async function generatePdfWithPuppeteer(html: string): Promise<Buffer> {
  try {
    // Пробуем загрузить puppeteer-core (для Railway)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = await import('puppeteer-core');

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });
    
    await browser.close();
    
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Puppeteer not available, falling back to HTML:', error);
    throw new Error('Puppeteer unavailable');
  }
}
