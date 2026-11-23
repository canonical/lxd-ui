import type { Page } from "@playwright/test";
import { expect } from "../fixtures/lxd-test";

export const expectUnsavedChangesWarning = async (
  page: Page,
  leave: () => Promise<void>,
) => {
  let message = "";
  page.once("dialog", (dialog) => {
    message = dialog.message();
    void dialog.dismiss();
  });
  await leave();
  await expect
    .poll(() => message)
    .toBe("Changes you made have not been saved. Do you want to discard them?");
};

// browsers show their own text for this dialog and report an empty message,
// so only the dialog type can be checked
export const expectCloseWarning = async (page: Page) => {
  let dialogType = "";
  page.once("dialog", (dialog) => {
    dialogType = dialog.type();
    void dialog.dismiss();
  });
  await page.close({ runBeforeUnload: true });
  await expect.poll(() => dialogType).toBe("beforeunload");
};

export const expectCloseWithoutWarning = async (page: Page) => {
  let dialogType = "";
  page.once("dialog", (dialog) => {
    dialogType = dialog.type();
    void dialog.dismiss();
  });
  const closed = page.waitForEvent("close");
  await page.close({ runBeforeUnload: true });
  await closed;
  expect(dialogType).toBe("");
};
