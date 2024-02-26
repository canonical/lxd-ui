import { FC } from "react";
import { Button, MainTable, useNotify } from "@canonical/react-components";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { loadCustomVolumes } from "context/loadCustomVolumes";
import ScrollableTable from "components/ScrollableTable";
import { LxdStorageVolume } from "types/storage";
import NotificationRow from "components/NotificationRow";
import { renderContentType } from "util/storageVolume";

interface Props {
  project: string;
  primaryVolume?: LxdStorageVolume;
  onFinish: (volume: LxdStorageVolume) => void;
  onCancel: () => void;
  onCreate: () => void;
}

const CustomVolumeSelectModal: FC<Props> = ({
  project,
  primaryVolume,
  onFinish,
  onCancel,
  onCreate,
}) => {
  const notify = useNotify();

  const {
    data: volumes = [],
    error,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [queryKeys.customVolumes],
    refetchOnMount: (query) => query.state.isInvalidated,
    queryFn: () => loadCustomVolumes(project),
  });

  if (error) {
    notify.failure("Loading storage volumes failed", error);
  }

  const handleSelect = (volume: LxdStorageVolume) => {
    notify.clear();
    onFinish(volume);
  };

  const headers = [
    { content: "Name" },
    { content: "Pool" },
    { content: "Content type" },
    { content: "Used by" },
    { "aria-label": "Actions", className: "actions" },
  ];

  const rows = isFetching
    ? []
    : volumes
        .sort((a, b) => (a.created_at > b.created_at ? -1 : 1))
        .map((volume) => {
          const selectVolume = () => handleSelect(volume);

          return {
            className: "u-row",
            columns: [
              {
                content: (
                  <div
                    className="u-truncate iso-name"
                    title={`Volume ${volume.name}`}
                  >
                    {volume.name}
                  </div>
                ),
                role: "cell",
                "aria-label": "Name",
                onClick: selectVolume,
              },
              {
                content: volume.pool,
                role: "cell",
                "aria-label": "Storage pool",
                onClick: selectVolume,
              },
              {
                content: renderContentType(volume),
                role: "cell",
                "aria-label": "Content type",
                onClick: selectVolume,
              },
              {
                content: volume.used_by?.length,
                role: "cell",
                "aria-label": "Used by",
                onClick: selectVolume,
              },
              {
                content: (
                  <Button
                    onClick={() => handleSelect(volume)}
                    dense
                    appearance={
                      primaryVolume?.name === volume.name &&
                      primaryVolume?.type === volume.type &&
                      primaryVolume?.pool == volume.pool
                        ? "positive"
                        : ""
                    }
                    aria-label={`Select ${volume.name}`}
                  >
                    Select
                  </Button>
                ),
                role: "cell",
                "aria-label": "Actions",
                className: "u-align--right",
                onClick: selectVolume,
              },
            ],
          };
        });

  return (
    <>
      <NotificationRow />
      <ScrollableTable
        dependencies={[volumes, rows, notify.notification]}
        belowIds={["modal-footer"]}
        tableId="volume-select-table"
      >
        <MainTable
          id="volume-select-table"
          headers={headers}
          rows={rows}
          sortable
          className="table-volume-select u-table-layout--auto"
          emptyStateMsg={
            isLoading || isFetching ? (
              <Loader text="Loading volumes..." />
            ) : (
              "No custom volumes found"
            )
          }
        />
      </ScrollableTable>
      {!isLoading && (
        <footer className="p-modal__footer" id="modal-footer">
          <Button
            className="u-no-margin--bottom"
            onClick={onCancel}
            appearance="base"
          >
            Cancel
          </Button>
          <Button
            className="u-no-margin--bottom"
            appearance={volumes.length === 0 ? "positive" : ""}
            onClick={onCreate}
          >
            Create volume
          </Button>
        </footer>
      )}
    </>
  );
};

export default CustomVolumeSelectModal;
