import React, { FC } from "react";
import { LxdImage } from "../../types/image";
import { StringParam, useQueryParam } from "use-query-params";
import { panelQueryParams } from "../../panels/queryparams";

type Props = {
  image: LxdImage;
};

const CreateInstanceBtn: FC<Props> = ({ image }) => {
  const setPanelQs = useQueryParam("panel", StringParam)[1];
  const setImageQs = useQueryParam("image", StringParam)[1];

  const handleCreate = () => {
    setImageQs(image.fingerprint);
    setPanelQs(panelQueryParams.instanceForm);
  };

  return (
    <button onClick={handleCreate} className="p-button is-dense">
      <i className="p-icon--add-canvas">Create instance</i>
    </button>
  );
};

export default CreateInstanceBtn;
