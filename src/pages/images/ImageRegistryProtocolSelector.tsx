import { type FC } from "react";
import { RadioInput, Icon } from "@canonical/react-components";
import type { FormikProps } from "formik";
import type { ImageRegistryFormValues } from "types/forms/image";
import { Link } from "react-router-dom";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
}
export const ImageRegistryProtocolSelector: FC<Props> = ({ formik }) => {
  return (
    <div className="image-registry-protocol-selector">
      <div>
        <label htmlFor="protocol">Protocol</label>
        <Link
          to="https://documentation.ubuntu.com/lxd/v5/reference/remote_image_servers/#remote-server-types"
          target="_blank"
          rel="noopener noreferrer"
          className="help-text help-link"
          title="Learn more about remote server types."
        >
          <Icon name="help" className="help-link-icon" />
        </Link>
      </div>
      <div id="protocol">
        <RadioInput
          inline
          aria-label="LXD"
          labelClassName="lxd-protocol-input"
          label="LXD"
          checked={formik.values.protocol === "lxd"}
          onChange={() => {
            formik.setFieldValue("protocol", "lxd");
          }}
        />
        <RadioInput
          inline
          aria-label="SimpleStreams"
          label="SimpleStreams"
          checked={formik.values.protocol === "simplestreams"}
          onChange={() => {
            formik.setFieldValue("protocol", "simplestreams");
          }}
        />
      </div>
    </div>
  );
};
