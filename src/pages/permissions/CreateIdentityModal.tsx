import type { FC } from "react";
import ResourceLabel from "components/ResourceLabel";
import { Modal } from "@canonical/react-components";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";

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

          <CodeSnippetWithCopyButton code={token} />
        </>
      )}
    </Modal>
  );
};

export default CreateIdentityModal;
