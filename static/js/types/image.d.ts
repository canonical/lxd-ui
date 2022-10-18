export interface LxdImage {
  fingerprint: string;
  public: boolean;
  properties: {
    description: string;
  };
  architecture: string;
  type: string;
  size: number;
  uploaded_at: string;
  aliases: string[];
}
