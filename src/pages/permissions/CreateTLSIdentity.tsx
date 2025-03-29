import { useState, type FC } from "react";
import CreateIdentityModal from "./CreateIdentityModal";
import CreateTLSIdentityPanel from "./panels/CreateTLSIdentityPanel";
import { usePortal } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";

const CreateTLSIdentity: FC = () => {
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal();
  const [token, setToken] = useState("");
  const [identityName, setIdentityName] = useState("");

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateIdentityModal
            onClose={closePortal}
            token={token}
            identityName={identityName}
          />
        </Portal>
      )}

      {panelParams.panel === panels.createTLSIdentity && (
        <CreateTLSIdentityPanel
          openPortal={openPortal}
          onSuccess={setToken}
          setIdentityName={setIdentityName}
        />
      )}
    </>
  );
};

export default CreateTLSIdentity;
