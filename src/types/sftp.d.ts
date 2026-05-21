export interface LxdSftpConnection {
  operation: string;
  metadata: {
    metadata: {
      fds: {
        "0": string; // Data channel WebSocket secret (file content/binary data)
        control: string; // Control channel WebSocket secret (SFTP protocol commands)
      };
    };
  };
}

export interface SftpFileInfo {
  name: string;
  type: "file" | "directory" | "symlink";
  size: number;
  modifyTime: number;
  permissions: number;
  owner: number;
  group: number;
}

export interface SftpListResponse {
  files: SftpFileInfo[];
  path: string;
}
