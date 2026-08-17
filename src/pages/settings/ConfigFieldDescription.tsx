import type { FC } from "react";
import { configDescriptionToHtml } from "util/config";
import { useQuery } from "@tanstack/react-query";
import { fetchDocObjects } from "api/server";

interface Props {
  description?: string;
  className?: string;
}

const ConfigFieldDescription: FC<Props> = ({ description, className }) => {
  const objectsInvTxt = useQuery({
    queryKey: ["documentation/objects.inv.txt"],
    queryFn: async () => fetchDocObjects(),
    staleTime: 60_000, // consider cache fresh for 1 minutes to avoid excessive API calls
  });

  return description ? (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: configDescriptionToHtml(description, objectsInvTxt.data),
      }}
    />
  ) : null;
};

export default ConfigFieldDescription;
