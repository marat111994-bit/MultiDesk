/**
 * Типы данных для генерации PDF коммерческого предложения
 */

/**
 * Данные для формы 1 — «Перевозка» (только транспорт)
 */
export interface PdfTransportData {
  type: 'transport';
  applicationNumber: string;    // "CD-070326-017"
  date: string;                 // ISO date
  cargo: {
    name: string;               // Полное название груза
    fkkoCode?: string;          // Код ФККО
    volume: number;             // Объём
    unit: string;               // Единица измерения: "т", "м³"
    compactionCoefficient?: number; // Коэффициент уплотнения т/м³
  };
  route: {
    loadingAddress: string;     // Адрес погрузки
    loadingMode?: string;       // Режим погрузки
    unloadingAddress: string;   // Адрес выгрузки
    unloadingMode?: string;     // Режим выгрузки
    distance: number;           // Расстояние в км
    mapUrl?: string;            // URL для Яндекс.Карт
  };
  pricing: {
    tariffPerTKm: number;       // Тариф за т×км (₽/т×км)
    tariffPerT: number;         // Тариф за т (₽/т) = tariffPerTKm × distance
    totalCost: number;          // Итого стоимость перевозки
  };
}

/**
 * Данные для формы 2 — «Перевозка + утилизация»
 */
export interface PdfDisposalData {
  type: 'transport-disposal';
  applicationNumber: string;
  date: string;
  cargo: {
    name: string;
    fkkoCode?: string;
    volume: number;
    unit: string;
    compactionCoefficient?: number;
  };
  route: {
    loadingAddress: string;
    loadingMode?: string;
    polygonName: string;        // Название полигона
    polygonAddress: string;     // Адрес полигона
    unloadingMode?: string;
    distance: number;
    mapUrl?: string;
  };
  pricing: {
    transport: {
      tariffPerTKm: number;     // Тариф за т×км (₽/т×км)
      tariffPerT: number;       // Тариф за т (₽/т)
      cost: number;             // Стоимость перевозки
    };
    disposal: {
      tariffPerT: number;       // Тариф утилизации (₽/т)
      cost: number;             // Стоимость утилизации
    };
    totalCost: number;          // Общая стоимость
  };
}

/**
 * Объединённый тип данных для PDF
 */
export type PdfData = PdfTransportData | PdfDisposalData;
