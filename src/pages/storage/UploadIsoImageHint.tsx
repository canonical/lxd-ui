import React, { FC } from "react";

const UploadIsoImageHint: FC = () => {
  return (
    <div className={`p-notification--caution`}>
      <div className="p-notification__content">
        <h5 className="p-notification__title">
          Image must be prepared with distrobuilder
        </h5>
        <p>
          For a windows image with name <code>WindowsIsoImage.iso</code> use the
          command
        </p>
        <pre className="p-code-snippet__block--icon">
          <code>
            sudo distrobuilder repack-windows WindowsIsoImage.iso win11.lxd.iso
          </code>
        </pre>
        <p>
          and upload the resulting <code>win11.lxd.iso</code> file.
        </p>
        <a
          href="https://discourse.ubuntu.com/t/how-to-install-a-windows-11-vm-using-lxd/28940"
          target="_blank"
          rel="noreferrer"
        >
          Learn how to install a Windows 11 VM using LXD
        </a>
      </div>
    </div>
  );
};

export default UploadIsoImageHint;
