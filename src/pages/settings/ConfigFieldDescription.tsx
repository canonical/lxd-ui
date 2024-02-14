import { FC } from "react";
import { useDocs } from "context/useDocs";
import { configDescriptionToHtml } from "util/config";
import { useQuery } from "@tanstack/react-query";
import { fetchDocObjects } from "api/server";
import { useSupportedFeatures } from "context/useSupportedFeatures";

interface Props {
  description?: string;
  className?: string;
}

const ConfigFieldDescription: FC<Props> = ({ description, className }) => {
  const docBaseLink = useDocs();
  const { hasDocumentationObject } = useSupportedFeatures();
  const objectsInvTxt = useQuery({
    queryKey: ["documentation/objects.inv.txt"],
    queryFn: () => fetchDocObjects(hasDocumentationObject),
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
