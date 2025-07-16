import type { FC } from "react";
import { useState } from "react";
import { Button, Icon, usePortal } from "@canonical/react-components";
import usePanelParams, { panels } from "util/usePanelParams";
import AddClusterMemberPanel from "pages/cluster/panels/AddClusterMemberPanel";
import AddClusterMemberModal from "pages/cluster/AddClusterMemberModal";
import { useSettings } from "context/useSettings";
import { hasMicroCloudFlag } from "util/settings";

const AddClusterMemberBtn: FC = () => {
  const panelParams = usePanelParams();
  const { openPortal, closePortal, isOpen, Portal } = usePortal({
    programmaticallyOpen: true,
  });
  const [token, setToken] = useState("");
  const [member, setMember] = useState("");
  const { data: settings } = useSettings();
  const isMicroCloud = hasMicroCloudFlag(settings);

  if (isMicroCloud) {
    return null; // In MicroCloud members are added through the CLI
  }

  return (
    <>
      <Button
        appearance="positive"
        className="u-no-margin--bottom"
        hasIcon
        onClick={panelParams.openAddClusterMember}
      >
        <Icon name="plus" light />
        <span>Add member</span>
      </Button>
      {panelParams.panel === panels.addClusterMember && (
        <AddClusterMemberPanel
          onSuccess={(member: string, token: string) => {
            setMember(member);
            setToken(token);
            openPortal();
          }}
        />
      )}
      {isOpen && (
        <Portal>
          <AddClusterMemberModal
            onClose={closePortal}
            token={token}
            member={member}
          />
        </Portal>
      )}
    </>
  );
};

export default AddClusterMemberBtn;
