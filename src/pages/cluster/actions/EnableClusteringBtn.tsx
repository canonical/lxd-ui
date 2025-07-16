import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import EnableClusteringModal from "pages/cluster/EnableClusteringModal";

const EnableClusteringBtn: FC = () => {
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  return (
    <>
      <Button appearance="positive" hasIcon onClick={openPortal}>
        <Icon name="plus" light />
        <span>Enable clustering</span>
      </Button>
      {isOpen && (
        <Portal>
          <EnableClusteringModal onClose={closePortal} />
        </Portal>
      )}
    </>
  );
};

export default EnableClusteringBtn;
