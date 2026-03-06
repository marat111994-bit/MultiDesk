// Базовые типы для калькулятора

export interface ContactData {
  name: string;
  phone: string;
}

/** @deprecated Не используется в новой версии калькулятора */
export interface CompanyData {
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

export interface CargoData {
  name: string;
  code: string;
  fkkoCode: string;
  volume: number;
  unit: 't' | 'm3';
  compaction: number;
  categoryCode?: string;
  hazardClass?: string;
  isCustomCargo?: boolean;
  customCargoName?: string;
}

export interface AddressData {
  address: string;
  coords: string;
  mode: 'day' | 'night' | '24';
}

export interface SelectedOption {
  polygonId: string;
  polygonName: string;
  polygonAddress: string;
  polygonCoords: string;
  distanceKm: number;
  transportPrice: number;
  utilizationPrice: number;
  totalPrice: number;
}

export interface TransportResult {
  distanceKm: number;
  transportTariff: number;
  transportPrice: number;
  totalPrice: number;
}

export interface FormData {
  // Общие поля
  contact: ContactData;
  cargo: CargoData;
  pickup: AddressData;
  // Ветка А
  dropoff?: AddressData;
  // Ветки Б и В
  selectedOption?: SelectedOption;
  // Результат расчёта (ветка А)
  result?: TransportResult;
  // ID заявки (для шага успеха)
  applicationId?: string;
  calculationId?: string;
}

export const createInitialFormData = (): FormData => ({
  contact: { name: '', phone: '' },
  cargo: { name: '', code: '', fkkoCode: '', volume: 1, unit: 't', compaction: 1, isCustomCargo: false, customCargoName: '' },
  pickup: { address: '', coords: '', mode: '24' },
});

// Типы для API ответов
export interface AddressSuggestion {
  value: string;
  coords: string;
}

export interface PolygonSearchResult {
  polygonId: string;
  receiverName: string;
  receiverInn: string | null;
  facilityAddress: string;
  facilityCoordinates: string | null;
  region: string | null;
  phone: string | null;
  email: string | null;
  kipNumber: string | null;
}

export interface Polygon {
  polygonId: string;
  polygonName: string;
  polygonAddress: string;
  polygonCoords: string | null;
  distanceKm: number;
  transportTariff: number;
  transportPrice: number;
  utilizationTariff: number;
  utilizationPrice: number;
  totalPrice: number;
}

export interface TransportCalculation {
  distanceKm: number;
  transportTariff: number;
  transportPrice: number;
  totalPrice: number;
  pickupAddress: string;
  dropoffAddress: string;
}

export interface DisposalCalculation {
  polygonId: string;
  polygonName: string;
  polygonAddress: string;
  polygonCoords: string;
  distanceKm: number;
  transportPrice: number;
  utilizationPrice: number;
  totalPrice: number;
}

export interface ApplicationResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
