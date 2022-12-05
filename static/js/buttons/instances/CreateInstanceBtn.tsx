import React, { FC } from "react";
import { LxdImage } from "../../types/image";
import usePanelParams from "../../util/usePanelParams";
import { Button } from "@canonical/react-components";

interface Props {
  image: LxdImage;
}

const CreateInstanceBtn: FC<Props> = ({ image }) => {
  const panelParams = usePanelParams();

  const handleCreate = () => {
    panelParams.openInstanceForm(image.fingerprint);
  };

  return (
    <Button dense onClick={handleCreate}>
      <i className="p-icon--add-canvas">Create instance</i>
    </Button>
  );
};

export default CreateInstanceBtn;
