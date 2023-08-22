import React, { FC } from "react";
import {
  EmptyState,
  Icon,
  MainTable,
  Row,
  useNotify,
} from "@canonical/react-components";
import { fetchStoragePools } from "api/storage-pools";
import BaseLayout from "components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import Loader from "components/Loader";
import { Link, useParams } from "react-router-dom";
import AddStorageBtn from "pages/storage/actions/AddStorageBtn";
import DeleteStorageBtn from "pages/storage/actions/DeleteStorageBtn";
import StorageSize from "pages/storage/StorageSize";
import NotificationRow from "components/NotificationRow";

const StorageList: FC = () => {
  const notify = useNotify();
  const { project } = useParams<{ project: string }>();

  if (!project) {
    return <>Missing project</>;
  }

  const {
    data: storagePools = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.storage, project],
    queryFn: () => fetchStoragePools(project),
  });

  if (error) {
    notify.failure("Loading storage pools failed", error);
  }

  const hasStoragePools = storagePools.length > 0;

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Driver", sortKey: "driver" },
    { content: "Size" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--right" },
    { content: "State", sortKey: "state" },
    { "aria-label": "Actions", className: "u-align--right" },
  ];

  const rows = storagePools.map((storage) => {
    return {
      columns: [
        {
          content: (
            <Link to={`/ui/project/${project}/storage/${storage.name}`}>
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
          className: "u-align--right",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: storage.name.toLowerCase(),
        driver: storage.driver,
        description: storage.description.toLowerCase(),
        state: storage.status,
        usedBy: storage.used_by?.length ?? 0,
      },
    };
  });

  return (
    <>
      <BaseLayout
        title="Storage pools"
        controls={
          hasStoragePools && (
            <AddStorageBtn project={project} className="u-no-margin--bottom" />
          )
        }
      >
        <NotificationRow />
        <Row>
          {hasStoragePools && (
            <MainTable
              headers={headers}
              rows={rows}
              paginate={30}
              responsive
              sortable
              className="u-table-layout--auto"
              emptyStateMsg={
                isLoading ? (
                  <Loader text="Loading storage pools..." />
                ) : (
                  "No data to display"
                )
              }
            />
          )}
          {!isLoading && !hasStoragePools && (
            <EmptyState
              className="empty-state"
              image={<Icon name="pods" className="empty-state-icon" />}
              title="No storage found"
            >
              <p>There are no storage pools in this project.</p>
              <p>
                <a
                  href="https://documentation.ubuntu.com/lxd/en/latest/explanation/storage/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn more about storage
                  <Icon className="external-link-icon" name="external-link" />
                </a>
              </p>
              <AddStorageBtn project={project} className="empty-state-button" />
            </EmptyState>
          )}
        </Row>
      </BaseLayout>
    </>
  );
};

export default StorageList;
