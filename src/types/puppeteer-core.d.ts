/**
 * Типы для puppeteer-core (опциональная зависимость)
 * Установите: npm install -D @types/puppeteer-core
 */

declare module 'puppeteer-core' {
  export interface LaunchOptions {
    headless: boolean | 'new';
    args?: string[];
    executablePath?: string;
  }

  export interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }

  export interface Page {
    setContent(html: string, options?: { waitUntil?: string }): Promise<void>;
    pdf(options?: PdfOptions): Promise<Buffer>;
  }

  export interface PdfOptions {
    format?: string;
    printBackground?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  }

  export function launch(options: LaunchOptions): Promise<Browser>;
  
  export default { launch };
}
