import React, { FC, useRef } from "react";
import { Button, Icon } from "@canonical/react-components";
import { LxdInstance } from "types/instance";
import { fetchInstanceLogFile } from "api/instances";

interface DownloadButtonProps {
  instance: LxdInstance;
  fileName: string;
  content: string;
}

const DownloadButton: FC<DownloadButtonProps> = ({
  instance,
  content,
  fileName,
}) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);

  const generateLink = (linkId: string, href: string) => {
    const link = document.createElement("a");
    link.setAttribute("href", href);
    link.setAttribute("target", "_blank");
    link.setAttribute("download", fileName);
    link.setAttribute("id", linkId);
    link.style.display = "none";

    return link;
  };

  const handleDownload = async () => {
    const linkId = `link-${fileName.toLowerCase().replace(" ", "-")}`;
    const alreadyCreatedLink = document.getElementById(linkId);

    if (alreadyCreatedLink) {
      alreadyCreatedLink.click();
      return;
    }

    const data =
      content ||
      (await fetchInstanceLogFile(instance.name, instance.project, fileName));
    const blob = new Blob([data], { type: "text/plain" });
    const href = URL.createObjectURL(blob);

    const link = generateLink(linkId, href);
    buttonRef.current?.appendChild(link);
    link.click();
  };

  return (
    <Button
      appearance="base"
      className="u-no-margin--bottom"
      onClick={() => void handleDownload()}
      title={`Download ${fileName}`}
      aria-label={`Download ${fileName} file`}
      hasIcon
      dense
      ref={buttonRef}
    >
      <Icon name="begin-downloading" alt="download" />
    </Button>
  );
};

export default DownloadButton;
