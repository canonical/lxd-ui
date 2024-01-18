import React, { FC } from "react";
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
    queryFn: fetchDocObjects,
  });

  return description ? (
    <p
      className={className}
      dangerouslySetInnerHTML={{
        __html: configDescriptionToHtml(
          description,
          docBaseLink,
          objectsInvTxt.data,
        ),
      }}
    ></p>
  ) : null;
};

export default ConfigFieldDescription;
