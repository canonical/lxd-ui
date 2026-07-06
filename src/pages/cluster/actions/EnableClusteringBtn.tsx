import type { FC } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import EnableClusteringModal from "pages/cluster/EnableClusteringModal";
import { useServerEntitlements } from "util/entitlements/server";

interface Props {
  className?: string;
  hasIcon?: boolean;
}

const EnableClusteringBtn: FC<Props> = ({ className, hasIcon = true }) => {
  const { canEditServerConfiguration } = useServerEntitlements();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });

  const canEdit = canEditServerConfiguration();
  const title = canEdit
    ? "Enable clustering"
    : "You do not have permission to edit the server";

  return (
    <>
      <Button
        appearance="default"
        className={className}
        hasIcon={hasIcon}
        onClick={openPortal}
        disabled={!canEdit}
        title={title}
      >
        {hasIcon && <Icon name="plus" />}
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
