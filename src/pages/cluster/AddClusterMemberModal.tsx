import type { FC } from "react";
import { Button, Modal } from "@canonical/react-components";
import CopyTextBtn from "components/CopyTextBtn";
import ResourceLabel from "components/ResourceLabel";
import { useDocs } from "context/useDocs";

interface Props {
  onClose: () => void;
  token: string;
  member: string;
}

const AddClusterMemberModal: FC<Props> = ({ onClose, token, member }) => {
  const docBaseLink = useDocs();

  return (
    <Modal
      close={onClose}
      className="create-tls-identity"
      title="Cluster join token created"
      buttonRow={
        <>
          {token && (
            <>
              <CopyTextBtn label="Copy join token" text={token} />
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
            The token below can be used to add cluster member{" "}
            <ResourceLabel type="cluster-member" value={member} bold /> to this
            cluster.
            <br />
            Learn{" "}
            <a
              href={`${docBaseLink}/howto/cluster_form/#join-additional-servers`}
              target="_blank"
              rel="noopener noreferrer"
            >
              how to add cluster members
            </a>
            . This token will expire after 3 hours.
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
