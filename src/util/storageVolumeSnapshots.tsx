import type { AnyObject, TestFunction } from "yup";
import type { AbortControllerState } from "./helpers";
import { checkDuplicateName } from "./helpers";
import * as Yup from "yup";
import type { LxdStorageVolume } from "types/storage";
import { testFutureDate, testValidDate, testValidTime } from "./snapshots";

export const testDuplicateVolumeSnapshotName = (
  volume: LxdStorageVolume,
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "Snapshot name already in use",
    async (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          volume.project,
          controllerState,
          `storage-pools/${encodeURIComponent(volume.pool)}/volumes/custom/${encodeURIComponent(volume.name)}/snapshots`,
          volume.location,
        )
      );
    },
  ];
};

export const getVolumeSnapshotSchema = (
  volume: LxdStorageVolume,
  controllerState: AbortControllerState,
  snapshotName?: string,
) => {
  return Yup.object().shape({
    name: Yup.string()
      .test(
        ...testDuplicateVolumeSnapshotName(
          volume,
          controllerState,
          snapshotName,
        ),
      )
      .matches(/^[A-Za-z0-9-_.:]+$/, {
        message:
          "Only alphanumeric characters, underscores, periods, hyphens, and colons are allowed in this field",
      }),
    expirationDate: Yup.string()
      .nullable()
      .optional()
      .test(...testValidDate())
      .test(...testFutureDate()),
    expirationTime: Yup.string()
      .nullable()
      .optional()
      .test(...testValidTime()),
  });
};
