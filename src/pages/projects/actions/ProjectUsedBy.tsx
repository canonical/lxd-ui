import { type FC } from "react";
import type { LxdProject } from "types/project";
import type { LxdUsedBy } from "util/usedBy";
import { filterUsedByType } from "util/usedBy";
import { Icon } from "@canonical/react-components";
import { useImagesInProject } from "context/useImages";
import ExpandableList from "components/ExpandableList";
import UsedByItem from "components/UsedByItem";

const INSTANCES = "Instances";
const PROFILES = "Profiles";
const IMAGES = "Images";
const CUSTOM_VOLUMES = "Custom volumes";

interface Props {
  project: LxdProject;
}

const ProjectUsedBy: FC<Props> = ({ project }) => {
  const { data: imagesFromProject = [] } = useImagesInProject(project.name);
  const data: Record<string, LxdUsedBy[]> = {
    [INSTANCES]: filterUsedByType("instance", project.used_by),
    [PROFILES]: filterUsedByType(
      "profile",
      project.used_by?.filter(
        // the default profile is not blocking project deletion and can't be removed itself
        (item) => !item.startsWith("/1.0/profiles/default"),
      ),
    ),
    [IMAGES]: filterUsedByType("image", project.used_by),
    [CUSTOM_VOLUMES]: filterUsedByType("volume", project.used_by),
  };

  return (
    <table className="p-main-table delete-project-table">
      <tbody>
        {data[INSTANCES].length > 0 && (
          <tr>
            <th>
              <Icon name="pods" className="icon" />
              Instances ({data[INSTANCES].length})
            </th>
            <td>
              <ExpandableList
                items={data[INSTANCES].map((item) => (
                  <UsedByItem
                    key={`${item.name}-${item.project}`}
                    item={item}
                    activeProject={project.name}
                    type="instance"
                    to={`/ui/project/${encodeURIComponent(item.project)}/instance/${encodeURIComponent(item.name)}`}
                  />
                ))}
              />
            </td>
          </tr>
        )}

        {data[PROFILES].length > 0 && (
          <tr>
            <th>
              <Icon name="repository" className="icon" />
              Profiles ({data[PROFILES].length})
            </th>
            <td>
              <ExpandableList
                items={data[PROFILES].map((item) => (
                  <UsedByItem
                    key={`${item.name}-${item.project}`}
                    item={item}
                    activeProject={project.name}
                    type="profile"
                    to={`/ui/project/${encodeURIComponent(item.project)}/profile/${encodeURIComponent(item.name)}`}
                  />
                ))}
              />
            </td>
          </tr>
        )}

        {data[IMAGES].length > 0 && (
          <tr>
            <th>
              <Icon name="image" className="icon" />
              Images ({data[IMAGES].length})
            </th>
            <td>
              <ExpandableList
                items={data[IMAGES].map((image) => {
                  const imageFromProject = imagesFromProject.find(
                    (img) => img.fingerprint === image.name,
                  );
                  return {
                    ...image,
                    name:
                      imageFromProject?.properties?.description || image.name,
                  };
                }).map((item) => (
                  <UsedByItem
                    key={`${item.name}-${item.project}`}
                    item={item}
                    activeProject={project.name}
                    type="image"
                    to={`/ui/project/${encodeURIComponent(item.project)}/images`}
                  />
                ))}
              />
            </td>
          </tr>
        )}

        {data[CUSTOM_VOLUMES].length > 0 && (
          <tr>
            <th>
              <Icon name="switcher-dashboard" className="icon" />
              Volumes ({data[CUSTOM_VOLUMES].length})
            </th>
            <td>
              <ExpandableList
                items={data[CUSTOM_VOLUMES].map((item) => (
                  <UsedByItem
                    key={`${item.name}-${item.project}-${item.target}`}
                    item={item}
                    activeProject={project.name}
                    type="volume"
                    to={`/ui/project/${encodeURIComponent(item.project)}/storage/volumes`}
                  />
                ))}
              />
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default ProjectUsedBy;
