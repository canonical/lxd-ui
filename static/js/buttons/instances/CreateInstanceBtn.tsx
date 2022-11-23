import React, { FC } from "react";
import { LxdImage } from "../../types/image";
import usePanelParams from "../../util/usePanelParams";

type Props = {
  image: LxdImage;
};

const CreateInstanceBtn: FC<Props> = ({ image }) => {
  const panelParams = usePanelParams();

  const handleCreate = () => {
    panelParams.openInstanceForm(image.fingerprint);
  };

  return (
    <button onClick={handleCreate} className="p-button is-dense">
      <i className="p-icon--add-canvas">Create instance</i>
    </button>
  );
};

export default CreateInstanceBtn;
