import { FC } from "react";
import { Icon } from "@canonical/react-components";

const UploadCustomImageHint: FC = () => {
  return (
    <>
      <div className={`p-notification--information`}>
        <div className="p-notification__content">
          <h3 className="p-notification__title">
            Some image formats need to be modified in order to work with LXD.
          </h3>
          <p>
            <a
              className="p-notification__action"
              href="https://ubuntu.com/tutorials/how-to-install-a-windows-11-vm-using-lxd#1-overview"
              target="_blank"
              rel="noopener noreferrer"
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
