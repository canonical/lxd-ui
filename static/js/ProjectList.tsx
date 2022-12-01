import React, { FC } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchProjects } from "./api/projects";
import BaseLayout from "./components/BaseLayout";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./util/queryKeys";
import useNotification from "./util/useNotification";

const ProjectList: FC = () => {
  const notify = useNotification();

  const { data: projects = [], error } = useQuery({
    queryKey: [queryKeys.projects],
    queryFn: fetchProjects,
  });

  if (error) {
    notify.failure("Could not load projects.", error);
  }

  const headers = [
    { content: "Name", sortKey: "name" },
    { content: "Images", sortKey: "images", className: "u-align--center" },
    { content: "Profiles", sortKey: "profiles", className: "u-align--center" },
    {
      content: "Storage volumes",
      sortKey: "storageVolumes",
      className: "u-align--center",
    },
    { content: "Networks", sortKey: "networks", className: "u-align--center" },
    { content: "Description", sortKey: "description" },
    { content: "Used by", sortKey: "usedBy", className: "u-align--center" },
    { content: "Actions", className: "u-align--center" },
  ];

  const rows = projects.map((project) => {
    return {
      columns: [
        {
          content: project.name,
          role: "rowheader",
          "aria-label": "Name",
        },
        {
          content: project.config["features.images"] ? "Yes" : "No",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Images",
        },
        {
          content: project.config["features.profiles"] ? "Yes" : "No",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Profiles",
        },
        {
          content: project.config["features.storage.volumes"] ? "Yes" : "No",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Storage volumes",
        },
        {
          content: project.config["features.networks"] ? "Yes" : "No",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Networks",
        },
        {
          content: project.description,
          role: "rowheader",
          "aria-label": "Description",
        },
        {
          content: project.used_by?.length || "0",
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Used by",
        },
        {
          content: <></>,
          role: "rowheader",
          className: "u-align--center",
          "aria-label": "Actions",
        },
      ],
      sortData: {
        name: project.name,
        images: project.config["features.images"],
        profiles: project.config["features.profiles"],
        storageVolumes: project.config["features.storage.volumes"],
        networks: project.config["features.networks"],
        description: project.description,
        usedBy: project.used_by?.length || 0,
      },
    };
  });

  return (
    <>
      <BaseLayout title="Projects">
        <NotificationRow notify={notify} />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="u-table-layout--auto"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ProjectList;
