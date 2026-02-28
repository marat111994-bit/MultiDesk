import type { FkkoRow } from "./fkko";
import type { PriceRow } from "./pricing";
import type { FaqItem } from "./faq";
import type { Advantage, TrustNumber } from "./common";

export interface Badge {
  value: string;
  label: string;
  icon: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  heroImage: string;
  heroImageAlt: string;
  topBadge?: string;
  badges: Badge[];
  seo: {
    title: string;
    description: string;
    h1: string;
    keywords: string[];
  };
  subcategories: Subcategory[];
  fkkoTable: FkkoRow[];
  pricing: PriceRow[];
  faq: FaqItem[];
  advantages: Advantage[];
  trustNumbers: TrustNumber[];
}

export interface Subcategory {
  id: string;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  shortDescription: string;
  heroImage: string;
  heroImageAlt: string;
  topBadge?: string;
  badges: Badge[];
  seo: {
    title: string;
    description: string;
    h1: string;
    keywords: string[];
  };
  parentSlug: string;
  relatedSubcategories: string[];
  fkkoTable: FkkoRow[];
  pricing: PriceRow[];
  faq: FaqItem[];
  advantages: Advantage[];
  trustNumbers: TrustNumber[];
}
