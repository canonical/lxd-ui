import React, { FC } from "react";
import { queryKeys } from "util/queryKeys";
import { fetchImage } from "api/images";
import { useQuery } from "@tanstack/react-query";

interface Props {
  id: string;
  project: string;
}

const ImageName: FC<Props> = ({ id, project }) => {
  const { data: image } = useQuery({
    queryKey: [queryKeys.images, id],
    queryFn: () => fetchImage(id, project),
  });

  const label = image?.properties.description
    ? image.properties.description
    : id;

  return (
    <div className="u-truncate" title={label}>
      {label}
    </div>
  );
};

export default ImageName;
