import type { FC } from "react";
import { useState } from "react";
import { Button, Icon, Modal } from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";

interface Props {
  onClose: () => void;
  token: string;
  identityName: string;
}

const CreateIdentityModal: FC<Props> = ({ onClose, token, identityName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);

        setTimeout(() => {
          setCopied(false);
        }, 5000);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Modal
      close={onClose}
      className="create-tls-identity"
      title="Identity created"
      buttonRow={
        <>
          {token && (
            <>
              <Button
                aria-label={
                  copied ? "Copied to clipboard" : "Copy to clipboard"
                }
                title="Copy token"
                className="u-no-margin--bottom"
                onClick={async () => handleCopy()}
                type="button"
                hasIcon
              >
                <Icon name={copied ? "task-outstanding" : "copy"} />
                <span>Copy trust token</span>
              </Button>

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
            The trust token below can be used to log in with the newly created
            identity <ResourceLabel type="certificate" value={identityName} /> .{" "}
            <b>
              Once this modal is closed, the trust token can&rsquo;t be
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
