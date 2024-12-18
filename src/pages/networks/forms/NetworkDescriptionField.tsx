import { FC } from "react";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";
import { Label } from "@canonical/react-components";

interface Props {
  props?: Record<string, unknown>;
}

const NetworkDescriptionField: FC<Props> = ({ props }) => {
  return (
    <>
      <Label>Description</Label>
      <AutoExpandingTextArea {...props} />
    </>
  );
};

export default NetworkDescriptionField;
