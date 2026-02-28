// Базовые типы для калькулятора

export interface ContactData {
  name: string;
  phone: string;
  email: string;
}

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
  company: CompanyData;
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
}

export const createInitialFormData = (): FormData => ({
  contact: { name: '', phone: '', email: '' },
  company: { name: '', inn: '', kpp: '', address: '' },
  cargo: { name: '', code: '', fkkoCode: '', volume: 0, unit: 't', compaction: 1 },
  pickup: { address: '', coords: '', mode: '24' },
});

// Типы для API ответов
export interface AddressSuggestion {
  value: string;
  coords: string;
}

export interface Polygon {
  id: string;
  name: string;
  address: string;
  region: string;
  coords: string;
  distanceKm: number;
  transportPrice: number;
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
