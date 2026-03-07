/**
 * PDF генератор коммерческих предложений DanMax
 */
export { generatePdf, generatePdfStream, formatNumber, formatCurrency } from './pdf-generator';
export type { PdfData, PdfTransportData, PdfDisposalData } from './types';
export { COMPANY } from './company-info';
export { COLORS, PAGE, FONT_SIZE, SPACING } from './pdf-styles';
