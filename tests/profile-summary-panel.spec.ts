import { test } from "./fixtures/lxd-test";
import {
  createProfile,
  deleteProfile,
  randomProfileName,
} from "./helpers/profile";
import {
  openProfileSummaryPanel,
  closeProfileSummaryPanel,
  navigateToProfileDetails,
} from "./helpers/profileSummaryPanel";

test("profile summary panel open and close", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await openProfileSummaryPanel(page, profile);
  await closeProfileSummaryPanel(page);
  await deleteProfile(page, profile);
});

test("navigate to profile detail from panel", async ({ page }) => {
  const profile = randomProfileName();
  await createProfile(page, profile);
  await openProfileSummaryPanel(page, profile);
  await navigateToProfileDetails(page, profile);
  await deleteProfile(page, profile);
});
