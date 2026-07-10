import { useState, type FC } from "react";
import { useNotify, usePortal } from "@canonical/react-components";
import { useQueryClient } from "@tanstack/react-query";
import CreateIdentityModal from "pages/permissions/CreateIdentityModal";
import CreateIdentityPanel from "pages/permissions/panels/CreateIdentityPanel";
import type { IdentityFormValues } from "types/forms/identity";
import usePanelParams, { panels } from "util/usePanelParams";
import {
  CREATE_IDENTITY_MODAL_TEXT,
  IDENTITY_TYPE,
} from "util/permissionIdentities";
import { queryKeys } from "util/queryKeys";

const CreateIdentity: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });
  const [token, setToken] = useState("");
  const [identity, setIdentity] = useState<IdentityFormValues>({
    name: "",
    groups: [],
    identityType: IDENTITY_TYPE.TLS,
    expiry: "",
  });
  const identityModalCaptions =
    CREATE_IDENTITY_MODAL_TEXT[identity.identityType];

  return (
    <>
      {isOpen && (
        <Portal>
          <CreateIdentityModal
            onClose={closePortal}
            token={token}
            identity={identity}
            title={identityModalCaptions.codeSnippetTitle}
            notification={`${identityModalCaptions.notificationTitle} ${identityModalCaptions.notificationBody}`}
            howToUseCli={identityModalCaptions.howToUseCli?.(token)}
            howToUseUi={identityModalCaptions.howToUseUi}
          />
        </Portal>
      )}

      {panelParams.panel === panels.createIdentity && (
        <CreateIdentityPanel
          onSuccess={(identity: IdentityFormValues, token: string) => {
            setIdentity(identity);
            setToken(token);
            queryClient.invalidateQueries({
              queryKey: [queryKeys.identities],
            });
            panelParams.clear();
            notify.clear();
            openPortal();
          }}
        />
      )}
    </>
  );
};

export default CreateIdentity;
