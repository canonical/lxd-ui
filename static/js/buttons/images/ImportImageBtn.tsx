import React, { FC, useState } from "react";
import { importImage } from "../../api/images";
import { RemoteImage } from "../../types/image";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../util/queryKeys";

type Props = {
  remoteImage: RemoteImage;
  onStartImport: Function;
  onSuccess: Function;
  onFailure: Function;
};

const ImportImageBtn: FC<Props> = ({
  remoteImage,
  onSuccess,
  onFailure,
  onStartImport,
}) => {
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleImport = () => {
    setLoading(true);
    onStartImport();
    importImage(remoteImage)
      .then(() => {
        setLoading(false);
        onSuccess(remoteImage);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.images],
        });
        navigate("/images");
      })
      .catch((e) => {
        setLoading(false);
        onFailure(`Error on image import. ${e.toString()}`);
      });
  };

  return (
    <button onClick={handleImport} className="is-dense" disabled={isLoading}>
      <i
        className={
          isLoading ? "p-icon--spinner u-animation--spin" : "p-icon--import"
        }
      >
        Delete
      </i>
    </button>
  );
};

export default ImportImageBtn;
