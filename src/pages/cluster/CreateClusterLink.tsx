import type { FC } from "react";
import { useState } from "react";
import { usePortal } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import CreateClusterLinkModal from "pages/cluster/modals/CreateClusterLinkModal";
import CreateClusterLinkPanel from "pages/cluster/panels/CreateClusterLinkPanel";

const CreateClusterLink: FC = () => {
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });
  const [token, setToken] = useState("");
  const [clusterName, setClusterName] = useState("");

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateClusterLinkModal
            onClose={closePortal}
            token={token}
            clusterName={clusterName}
          />
        </Portal>
      )}

      {panelParams.panel === panels.createClusterLink && (
        <CreateClusterLinkPanel
          onSuccess={(clusterName: string, token: string) => {
            setClusterName(clusterName);
            setToken(token);
            openPortal();
          }}
        />
      )}
    </>
  );
};

export default CreateClusterLink;
