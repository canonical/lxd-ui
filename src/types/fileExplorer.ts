export interface LxdFileExplorerItem {
  operation: string;
  metadata: string[];
}

export interface FileMetadata {
  name: string;
  type: string;
  modified: string;
}
