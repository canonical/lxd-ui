import type { FC } from "react";
import ResourceLabel from "components/ResourceLabel";
import { Button, Modal } from "@canonical/react-components";
import CopyTextBtn from "components/CopyTextBtn";

interface Props {
  onClose: () => void;
  token: string;
  identityName: string;
}

const CreateIdentityModal: FC<Props> = ({ onClose, token, identityName }) => {
  return (
    <Modal
      close={onClose}
      className="create-tls-identity"
      title="Identity created"
      buttonRow={
        <>
          {token && (
            <>
              <CopyTextBtn label="Copy identity trust token" text={token} />
              <Button
                aria-label="Close"
                className="u-no-margin--bottom"
                onClick={onClose}
                type="button"
              >
                Close
              </Button>
            </>
          )}
        </>
      }
    >
      {token && (
        <>
          <p>
            The identity trust token below can be used to log in with the newly
            created identity{" "}
            <ResourceLabel type="certificate" value={identityName} /> .{" "}
            <b>
              Once this modal is closed, the identity trust token can&rsquo;t be
              generated again.
            </b>
          </p>

          <div className="token-code-block">
            <code>{token}</code>
          </div>
        </>
      )}
    </Modal>
  );
};

export default CreateIdentityModal;
