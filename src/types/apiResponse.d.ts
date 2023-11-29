export interface LxdApiResponse<T> {
  metadata: T;
}

export interface LxdSyncResponse<T> {
  type: "sync";
  status: string;
  status_code: number;
  error_code: number;
  error: string;
  metadata: T;
}
