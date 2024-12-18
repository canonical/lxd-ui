import { FC } from "react";
import { fetchNetwork } from "api/networks";
import { queryKeys } from "util/queryKeys";
import { useQuery } from "@tanstack/react-query";
import ResourceLink from "components/ResourceLink";
import { Label } from "@canonical/react-components";
import { ResourceIconType } from "components/ResourceIcon";
import ExpandableList from "components/ExpandableList";

interface Props {
  props: Record<string, unknown>;
  project: string;
}

const NetworkProfiles: FC<Props> = ({ props, project }) => {
  const { value } = props;
  const { data: network } = useQuery({
    queryKey: [queryKeys.networks],
    queryFn: () => fetchNetwork(value as string, project),
  });
  const profileList =
    network?.used_by?.map((item) => {
      const parts = item.split("/");
      const type = parts[2].slice(0, -1);
      const name = parts[3];

      return { type, name };
    }) || [];
  console.log(props);

  return (
    <>
      <Label>Used by</Label>
      <ExpandableList
        items={profileList.map((item) => (
          <ResourceLink
            key={item.name}
            type={item.type as ResourceIconType}
            value={item.name}
            to={`/ui/project/${project}/${item.type}/${item.name}`}
          />
        ))}
      />
    </>
  );
};

export default NetworkProfiles;
