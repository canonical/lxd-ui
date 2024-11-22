declare module "lib/spice/src/main.js" {
  export class SpiceMainConn {
    constructor(options: {
      uri: string;
      screen_id: string;
      onerror: (e: object) => void;
      onsuccess: () => void;
      onagent: () => void;
    });
    stop(): void;
  }
  export function handle_resize(): void;
}
