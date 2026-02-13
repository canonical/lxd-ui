declare module "lib/spice/src/inputs.js" {
  import type * as SpiceHtml5 from "lib/spice/src/main";

  export function sendAltF4(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendAltTab(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendCtrlAltDel(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF1(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF2(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF3(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF4(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF5(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF6(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF7(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF8(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF9(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF10(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF11(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendF12(connection?: SpiceHtml5.SpiceMainConn): void;
  export function sendPrintScreen(connection?: SpiceHtml5.SpiceMainConn): void;

  export function isAltPressed(connection?: SpiceHtml5.SpiceMainConn): boolean;
  export function isCtrlPressed(connection?: SpiceHtml5.SpiceMainConn): boolean;

  export function toggleAlt(connection?: SpiceHtml5.SpiceMainConn): void;
  export function toggleCtrl(connection?: SpiceHtml5.SpiceMainConn): void;
}
