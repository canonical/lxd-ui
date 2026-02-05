export interface UploadExternalFormatFileFormValues {
  file: File | null;
  name: string;
  pool: string;
  member: string;
  formatConversion: boolean;
  virtioConversion: boolean;
  architecture: string;
}
