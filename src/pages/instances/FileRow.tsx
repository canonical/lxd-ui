import React, { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, Icon } from "@canonical/react-components";
import { queryKeys } from "util/queryKeys";
import { fetchInstanceLogFile } from "api/instances";
import { LxdInstance } from "types/instance";
import DownloadButton from "pages/instances/DownloadButton";
import { getUrlParam } from "util/helpers";

interface FileRowProps {
  instance: LxdInstance;
  path: string;
}

const FileRow: FC<FileRowProps> = ({ instance, path }) => {
  const fileName = path.split("/").at(-1) ?? "";
  const fileUrl = `/ui/project/${instance.project}/instances/detail/${instance.name}/logs/?file=${fileName}`;
  const [isOpen, setOpen] = useState(getUrlParam("file") === fileName);

  const {
    data: logContent,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: [
      queryKeys.instances,
      instance.name,
      instance.project,
      queryKeys.logs,
      fileName,
    ],
    queryFn: () =>
      fetchInstanceLogFile(instance.name, instance.project, fileName),
    enabled: isOpen,
  });

  const toggleVisibility = () => {
    setOpen((prevState) => !prevState);
  };

  return (
    <div className="p-code-snippet file-row">
      <div className="p-code-snippet__header file-row-header">
        <Button
          appearance="base"
          hasIcon
          className="u-no-margin--bottom file-row-toggle"
          aria-label={`Toggle ${fileName} visibility`}
          aria-controls={fileName}
          aria-hidden={!isOpen}
          onClick={toggleVisibility}
        >
          <Icon name={isOpen ? "chevron-up" : "chevron-down"} />
          <h3 className="p-code-snippet__title file-row-title">{fileName}</h3>
        </Button>
        <a
          href={fileUrl}
          aria-label={`File ${fileName} URL`}
          className="p-button--base u-no-margin--bottom"
        >
          <Icon name="get-link" alt="link" />
        </a>
        <DownloadButton
          fileName={fileName}
          instance={instance}
          content={logContent ?? ""}
        />
      </div>

      {isOpen && (
        <pre
          id={fileName}
          className="p-code-snippet__block"
          aria-hidden={!isOpen}
        >
          <code>
            {isLoading && <>Downloading file content...</>}
            {isSuccess && !logContent && <>This file is empty.</>}
            {isSuccess && logContent && <>{logContent}</>}
          </code>
        </pre>
      )}
    </div>
  );
};

export default FileRow;
