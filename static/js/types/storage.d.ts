export interface LxdStorage {
  config?: {
    size?: string;
  };
  description: string;
  driver: string;
  locations?: string[];
  name: string;
  source?: string;
  status?: string;
  used_by?: string[];
}
