import type { FC } from "react";
import { Button, Modal } from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";

interface Props {
  onClose: () => void;
  token: string;
  clusterName: string;
}

const CreateClusterLinkModal: FC<Props> = ({ onClose, token, clusterName }) => {
  return (
    <Modal
      close={onClose}
      className="create-cluster-link"
      title="Cluster link created"
      buttonRow={
        <>
          {token && (
            <>
              <p>
                The cluster link token below can be used to connect a cluster.
                Once this modal is closed, the identity trust token can&rsquo;t
                be generated again.
              </p>
              <CodeSnippetWithCopyButton code={token} />
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
            The trust token below can be used to establish the cluster link{" "}
            <ResourceLabel type="cluster-link" value={clusterName} bold /> on
            the target cluster.{" "}
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

export default CreateClusterLinkModal;
