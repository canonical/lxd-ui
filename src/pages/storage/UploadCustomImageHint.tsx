import React, { FC } from "react";
import { Icon } from "@canonical/react-components";

const UploadCustomImageHint: FC = () => {
  return (
    <>
      <div className={`p-notification--information`}>
        <div className="p-notification__content">
          <h5 className="p-notification__title">
            Some image formats need to be modified in order to work with LXD.
          </h5>
          <p>
            <a
              className="p-notification__action"
              href="https://discourse.ubuntu.com/t/how-to-install-a-windows-11-vm-using-lxd/28940"
              target="_blank"
              rel="noreferrer"
            >
              Windows ISO images
              <Icon className="external-link-icon" name="external-link" />
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default UploadCustomImageHint;
