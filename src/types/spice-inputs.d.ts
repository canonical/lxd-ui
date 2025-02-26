declare module "lib/spice/src/inputs.js" {
  import type * as SpiceHtml5 from "lib/spice/src/main";

  export function sendAltF4(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendAltTab(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendCtrlAltDel(connection?: SpiceHtml5.SpiceMainConn): void;
}
