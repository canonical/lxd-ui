import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import { fetchStorages } from "api/storages";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "context/notify";
import Loader from "components/Loader";
import { Link, useParams } from "react-router-dom";
import AddStorageBtn from "pages/storages/actions/AddStorageBtn";
import DeleteStorageBtn from "pages/storages/actions/DeleteStorageBtn";
import StorageSize from "pages/storages/StorageSize";

const StorageList: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: storages = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, project],
    queryFn: () => fetchStorages(project),
  });

  if (error) {
    notify.failure("Could not load storages.", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver" },
    { content: "Size" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--right" },
    { content: "State", sortKey: "state" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = storages.map((storage) => {
    return {
      columns: [
        {
          content: (
            <Link to={`/ui/${project}/storages/${storage.name}`}>
              {storage.name}
            </Link>
          ),
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: storage.driver,
          role: "rowheader",
          "aria-label": "Driver",
        },
        {
          content: <StorageSize storage={storage} />,
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
          className: "u-align--right",
          "aria-label": "Used by",
        },
        {
          content: storage.status,
          role: "rowheader",
          "aria-label": "State",
        },
        {
          content: <DeleteStorageBtn storage={storage} project={project} />,
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
      <BaseLayout
        title="Storages"
        controls={<AddStorageBtn project={project} />}
      >
        <NotificationRow />
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
