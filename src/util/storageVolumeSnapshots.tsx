import { AnyObject, TestFunction } from "yup";
import { AbortControllerState, checkDuplicateName } from "./helpers";
import * as Yup from "yup";
import { LxdStorageVolume } from "types/storage";
import { testFutureDate, testValidDate, testValidTime } from "./snapshots";

/*** Volume snapshot utils ***/
export const testDuplicateVolumeSnapshotName = (
  volume: LxdStorageVolume,
  controllerState: AbortControllerState,
  excludeName?: string,
): [string, string, TestFunction<string | undefined, AnyObject>] => {
  return [
    "deduplicate",
    "Snapshot name already in use",
    (value?: string) => {
      return (
        (excludeName && value === excludeName) ||
        checkDuplicateName(
          value,
          volume.project,
          controllerState,
          `storage-pools/${volume.pool}/volumes/custom/${volume.name}/snapshots`,
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
          "Please enter only alphanumeric characters, underscores (_), periods (.), hyphens (-), and colons (:) in this field",
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
