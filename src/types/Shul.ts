export interface Shul {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  address: string;
  isEnabled: boolean;
}

export interface ShulLockState {
  isActive: boolean;
  activeShulName: string | null;
  activeShulId: string | null;
}

export interface AppSettings {
  autoActivate: boolean;
  autoDeactivate: boolean;
  startupMode: boolean;
}

export interface SearchResult {
  address: string;
  latitude: number;
  longitude: number;
}
