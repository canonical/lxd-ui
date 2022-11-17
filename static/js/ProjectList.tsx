import React, { FC, useEffect, useState } from "react";
import { MainTable, Row } from "@canonical/react-components";
import NotificationRow from "./components/NotificationRow";
import { fetchProjectList } from "./api/projects";
import { Notification } from "./types/notification";
import { LxdProject } from "./types/project";
import { useQueryParam, StringParam } from "use-query-params";
import BaseLayout from "./components/BaseLayout";
import { panelQueryParams } from "./util/panelQueryParams";

const ProjectList: FC = () => {
  const [projects, setProjects] = useState<LxdProject[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const setPanelQs = useQueryParam("panel", StringParam)[1];

  const setFailure = (message: string) => {
    setNotification({
      message,
      type: "negative",
    });
  };

  const loadProjects = async () => {
    try {
      const projects = await fetchProjectList();
      setProjects(projects);
    } catch (e) {
      setFailure("Could not load projects.");
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

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
      <BaseLayout
        title="Projects"
        controls={
          <button
            className="p-button--positive u-no-margin--bottom"
            onClick={() => setPanelQs(panelQueryParams.projectForm)}
          >
            Add project
          </button>
        }
      >
        <NotificationRow
          notification={notification}
          close={() => setNotification(null)}
        />
        <Row>
          <MainTable
            headers={headers}
            rows={rows}
            paginate={30}
            responsive
            sortable
            className="p-table--projects"
          />
        </Row>
      </BaseLayout>
    </>
  );
};

export default ProjectList;
