import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchStorages } from "./api/storages";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";
import Loader from "./components/Loader";

const StorageList: FC = () => {
  const notify = useNotification();

  const {
    data: storages = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage],
    queryFn: fetchStorages,
  });

  if (error) {
    notify.failure("Could not load storage.", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver" },
    { content: "Size" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--center" },
    { content: "State", sortKey: "state" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = storages.map((storage) => {
    return {
      columns: [
        {
          content: storage.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: storage.driver,
          role: "rowheader",
          "aria-label": "Driver",
        },
        {
          content: storage.config["volume.size"],
          role: "rowheader",
          "aria-label": "Size",
        },
        {
          content: storage.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: storage.used_by?.length ?? "0",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Used by",
        },
        {
          content: storage.status,
          role: "rowheader",
          "aria-label": "State",
        },
        {
          content: <></>,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: storage.name,
        driver: storage.driver,
        description: storage.description,
        state: storage.status,
        usedBy: storage.used_by?.length ?? 0,
      },
    };
  });

  return (
    <>
      <BaseLayout title="Storages">
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
            emptyStateMsg={
              isLoading ? (
                <Loader text="Loading storages..." />
              ) : (
                "No data to display"
              )
            }
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default StorageList;
