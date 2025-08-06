import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import EnableClusteringModal from "pages/cluster/EnableClusteringModal";
import { useServerEntitlements } from "util/entitlements/server";

const EnableClusteringBtn: FC = () => {
  const { canEditServerConfiguration } = useServerEntitlements();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  const editRestriction = canEditServerConfiguration()
    ? "Enable clustering"
    : "You do not have permission to edit the server";

  return (
    <>
      <Button
        appearance="positive"
        hasIcon
        onClick={openPortal}
        disabled={!!editRestriction}
        title={editRestriction}
      >
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
