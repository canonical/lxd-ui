import { useMemo, type FC } from "react";
import type { LxdProject } from "types/project";
import { filterUsedByType } from "util/usedBy";
import type { ResourceType } from "util/resourceDetails";
import ResourceLink from "components/ResourceLink";
import { Icon, MainTable } from "@canonical/react-components";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import "./ProjectUsedByList.scss";
import { useImagesInProject } from "context/useImages";

const instancesRow = (
  instances: string[],
  projectName: string,
): MainTableRow | null => {
  if (!instances.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="pods" className="icon" />
            Instances ({instances.length})
          </>
        ),
      },
      {
        content: instances.map((instance) => (
          <div key={instance}>
            <ResourceLink
              type="instance"
              value={instance}
              to={`/ui/project/${encodeURIComponent(projectName)}/instance/${encodeURIComponent(instance)}`}
            />
          </div>
        )),
      },
    ],
  };
};

const profilesRow = (
  profiles: string[],
  projectName: string,
): MainTableRow | null => {
  if (!profiles.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="repository" className="icon" />
            Profiles ({profiles.length})
          </>
        ),
      },
      {
        content: profiles.map((profile) => (
          <div key={profile}>
            <ResourceLink
              type="profile"
              value={profile}
              to={`/ui/project/${encodeURIComponent(projectName)}/profiles/${encodeURIComponent(profile)}`}
            />
          </div>
        )),
      },
    ],
  };
};

const imagesRow = (images: string[]): MainTableRow | null => {
  if (!images.length) {
    return null;
  }

  return {
    columns: [
      {
        content: (
          <>
            <Icon name="image" className="icon" />
            Images ({images.length})
          </>
        ),
      },
      {
        content: images.map((image) => <div key={image}>{image}</div>),
      },
    ],
  };
};

const volumesRow = (volumes: string[]): MainTableRow | null => {
  if (!volumes.length) {
    return null;
  }
  return {
    columns: [
      {
        content: (
          <>
            <Icon name="switcher-dashboard" className="icon" />
            Volumes ({volumes.length})
          </>
        ),
      },
      {
        content: volumes.map((volume) => <div key={volume}>{volume}</div>),
      },
    ],
  };
};

interface Props {
  project: LxdProject;
}

const ProjectUsedByList: FC<Props> = ({ project }) => {
  const { data: imagesFromProject = [] } = useImagesInProject(project.name);
  const resourceTypes = ["instance", "profile", "image", "volume"];

  const rows = resourceTypes.map((resourceType) => {
    const usedBy = filterUsedByType(
      resourceType as ResourceType,
      project.used_by?.filter(
        // the default profile is not blocking project deletion and can't be removed itself
        (item) => !item.startsWith("/1.0/profiles/default"),
      ),
    );

    return {
      type: resourceType as ResourceType,
      count: usedBy.length,
      items: usedBy,
    };
  });

  const getItems = (
    rows: {
      type: ResourceType;
      count: number;
      items: { name: string; project: string; instance?: string }[];
    }[],
    resourceType: string,
  ) => {
    return rows
      .filter((t) => t.type === resourceType && t.count > 0)
      .flatMap((t) => t.items)
      .map((t) => t.name);
  };

  const instances = getItems(rows, "instance");
  const profiles = getItems(rows, "profile");
  const images = getItems(rows, "image")
    .map((fingerprint) =>
      imagesFromProject.find((img) => img.fingerprint === fingerprint),
    )
    .filter((t) => !!t)
    .map((t) => t.properties?.description || "");
  const volumes = getItems(rows, "volume");

  const tableRows = useMemo(() => {
    return [
      instancesRow(instances, project.name),
      profilesRow(profiles, project.name),
      imagesRow(images),
      volumesRow(volumes),
    ].filter((row): row is Exclude<typeof row, null> => row !== null);
  }, [instances, profiles, images, volumes]);

  return (
    <>
      <MainTable
        headers={[{ content: "type" }, { content: "name" }]}
        rows={tableRows}
        className="p-main-table delete-project-table"
      />
    </>
  );
};

export default ProjectUsedByList;
