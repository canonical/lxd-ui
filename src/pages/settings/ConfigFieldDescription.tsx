import type { FC } from "react";
import { useDocs } from "context/useDocs";
import { configDescriptionToHtml } from "util/config";
import { useQuery } from "@tanstack/react-query";
import { fetchDocObjects } from "api/server";

interface Props {
  description?: string;
  className?: string;
}

const ConfigFieldDescription: FC<Props> = ({ description, className }) => {
  const docBaseLink = useDocs();
  const objectsInvTxt = useQuery({
    queryKey: ["documentation/objects.inv.txt"],
    queryFn: async () => fetchDocObjects(),
    staleTime: 60_000, // consider cache fresh for 1 minutes to avoid excessive API calls
  });

  return description ? (
    <span
      className={className}
      dangerouslySetInnerHTML={{
        __html: configDescriptionToHtml(
          description,
          docBaseLink,
          objectsInvTxt.data,
        ),
      }}
    />
  ) : null;
};

export default ConfigFieldDescription;
