import { LxdInstance, LxdInstanceStatus } from "types/instance";
import { pluralize } from "./instanceBulkActions";

export const validMigrateStatuses: LxdInstanceStatus[] = ["Running", "Stopped"];

export const getValidInstancesForMigration = (
  instances: LxdInstance[],
  selectedMember: string,
) => {
  const validInstances = instances.filter((instance) => {
    return instance.location !== selectedMember;
  });

  const migrateCount = validInstances.length;
  const totalCount = instances.length;
  const ignoreCount = totalCount - migrateCount;
  const noMigration = migrateCount === 0;
  const allMigrated = ignoreCount === 0;
  const someMigrated = migrateCount > 0 && ignoreCount > 0;

  let summary = null;
  if (noMigration) {
    summary = (
      <p>
        {totalCount > 1 ? (
          "All selected instances are"
        ) : (
          <>
            The selected instance <strong>{instances[0].name}</strong> is
          </>
        )}{" "}
        already on the target cluster member <strong>{selectedMember}</strong>.
      </p>
    );
  }

  if (allMigrated) {
    const instanceText =
      totalCount === 1 ? (
        <>
          instance <strong>{instances[0].name}</strong>
        </>
      ) : (
        <strong>{totalCount} instances</strong>
      );

    summary = (
      <p>
        This will migrate {instanceText} to cluster member{" "}
        <b>{selectedMember}</b>.
      </p>
    );
  }

  if (someMigrated) {
    summary = (
      <p>
        <p>
          {totalCount} {pluralize("instance", totalCount)} selected:
        </p>
        <p className="u-no-margin--bottom">
          - <b>{migrateCount}</b> {pluralize("instance", migrateCount)} will be
          migrated to cluster member <strong>{selectedMember}</strong>
        </p>
        <p className="u-no-margin--bottom">
          - <b>{ignoreCount}</b> {pluralize("instance", ignoreCount)}{" "}
          {ignoreCount > 1 ? "are" : "is"} already on the target cluster member{" "}
          <strong>{selectedMember}</strong>
        </p>
      </p>
    );
  }

  return {
    summary: <div className="migrate-instance-summary">{summary}</div>,
    validInstances,
  };
};
