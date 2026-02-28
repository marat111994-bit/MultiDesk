export interface TrustNumber {
  value: number;
  suffix?: string;
  label: string;
  icon?: string; // идентификатор иконки из lucide-react
}

export interface Advantage {
  title: string;
  description: string;
  icon: string; // идентификатор иконки из lucide-react
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: string; // идентификатор иконки из lucide-react
}

export interface CaseItem {
  title: string;
  image: string;
  volume: string;
  duration: string;
  serviceType: string;
  description?: string;
}

export interface Client {
  name: string;
  logo: string;
}

export interface NavigationItem {
  label: string;
  href: string;
  children?: NavigationItem[];
}

export interface ContactInfo {
  phone: string;
  phoneRaw: string; // для ссылок tel:
  telegram: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageSeo {
  title: string;
  description: string;
  h1: string;
  ogImage?: string;
}
