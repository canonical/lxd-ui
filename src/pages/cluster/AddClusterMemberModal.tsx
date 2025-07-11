import type { FC } from "react";
import { useState } from "react";
import { Button, Icon, Modal } from "@canonical/react-components";

interface Props {
  onClose: () => void;
  token: string;
  member: string;
}

const AddClusterMemberModal: FC<Props> = ({ onClose, token, member }) => {
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
      title={`Joint token for member ${member} created`}
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
                <span>Copy join token</span>
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
            The join token below can be used to add a new cluster member by
            running <code>lxd init</code> on the new member.
          </p>
          <div className="token-code-block">
            <code>{token}</code>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AddClusterMemberModal;
