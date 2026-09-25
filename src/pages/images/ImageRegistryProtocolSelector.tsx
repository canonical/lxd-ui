import { type FC } from "react";
import { RadioInput } from "@canonical/react-components";
import type { FormikProps } from "formik";
import type { ImageRegistryFormValues } from "types/forms/image";
import ExplanationTooltip from "components/ExplanationTooltip";

interface Props {
  formik: FormikProps<ImageRegistryFormValues>;
}
export const ImageRegistryProtocolSelector: FC<Props> = ({ formik }) => {
  return (
    <div className="image-registry-protocol-selector">
      <ExplanationTooltip
        explanation="Select the protocol for the remote image server."
        docPath="/reference/remote_image_servers/#remote-server-types"
        docLabel="Learn more about remote server types."
        className="explanation-tooltip-wrapper--inline"
      >
        Protocol
      </ExplanationTooltip>
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
