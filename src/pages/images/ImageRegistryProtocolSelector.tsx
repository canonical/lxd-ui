import { type FC } from "react";
import { RadioInput } from "@canonical/react-components";
import HelpLink from "components/HelpLink";
import type { FormikProps } from "formik";
import type { ImageRegistryFormValues } from "types/forms/image";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
}
export const ImageRegistryProtocolSelector: FC<Props> = ({ formik }) => {
  return (
    <div className="image-registry-protocol-selector">
      <HelpLink
        docPath="/reference/remote_image_servers/#remote-server-types"
        title="Learn more about remote server types."
      >
        <label htmlFor="protocol" className="u-no-margin--bottom">
          Protocol
        </label>
      </HelpLink>
      <div id="protocol">
        <RadioInput
          inline
          aria-label="LXD"
          className="lxd-protocol-input"
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
