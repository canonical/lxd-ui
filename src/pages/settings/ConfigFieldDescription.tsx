import React, { FC } from "react";
import { useDocs } from "context/useDocs";
import { configDescriptionToHtml } from "util/config";

interface Props {
  description?: string;
  className?: string;
}

const ConfigFieldDescription: FC<Props> = ({ description, className }) => {
  const docBaseLink = useDocs();

  return description ? (
    <p
      className={className}
      dangerouslySetInnerHTML={{
        __html: configDescriptionToHtml(description, docBaseLink),
      }}
    ></p>
  ) : null;
};

export default ConfigFieldDescription;
