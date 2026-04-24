import type { FC } from "react";
import { List } from "@canonical/react-components";
import type { LxdImageRegistry } from "types/image";
import EditImageRegistryButton from "../EditImageRegistryButton";

interface Props {
  imageRegistry: LxdImageRegistry;
  isShortVersion?: boolean;
}

export const ImageRegistryActions: FC<Props> = ({
  imageRegistry,
  isShortVersion = false,
}) => {
  return (
    <List
      inline
      className="u-no-margin--bottom actions-list"
      items={[
        <EditImageRegistryButton
          key="edit"
          imageRegistry={imageRegistry}
          isShortVersion={isShortVersion}
        />,
        <EditImageRegistryButton
          key="delete"
          imageRegistry={imageRegistry}
          isShortVersion={isShortVersion}
        />,
      ]}
    />
  );
};
