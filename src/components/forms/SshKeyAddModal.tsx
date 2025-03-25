import type { FC, FormEvent, ReactNode } from "react";
import { useState } from "react";
import { Button, Form, Input, Label, Modal } from "@canonical/react-components";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";

interface Props {
  initialName: string;
  onSelect: (name: string, user: string, fingerprint: string) => void;
  onClose: () => void;
}

type SourceType = "clipboard" | "fileUpload" | "github" | "launchpad";

const SshKeyAddModal: FC<Props> = ({ initialName, onSelect, onClose }) => {
  const [name, setName] = useState(initialName);
  const [user, setUser] = useState("root");
  const [sourceType, setSourceType] = useState<SourceType>("clipboard");
  const [source, setSource] = useState("");

  const getFingerprint = () => {
    switch (sourceType) {
      case "github":
        return `gh:${source}`;
      case "launchpad":
        return `lp:${source}`;
      case "fileUpload":
        return source;
      case "clipboard":
        return source;
    }
  };

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fingerprint = getFingerprint();
    onSelect(name, user, fingerprint);
  };

  const segmentButton = (id: SourceType, label: string) => {
    return (
      <button
        className="p-segmented-control__button"
        role="tab"
        type="button"
        aria-selected={sourceType === id ? "true" : "false"}
        aria-controls={`${id}-tab`}
        id={id}
        onClick={() => {
          setSourceType(id);
          setSource("");
        }}
      >
        {label}
      </button>
    );
  };

  const segmentContent = (id: SourceType, children: ReactNode) => {
    if (id !== sourceType) {
      return null;
    }

    return (
      <div role="tabpanel" id={`${id}-tab`} aria-labelledby={id}>
        {children}
      </div>
    );
  };

  return (
    <Modal close={onClose} title="Add SSH key" className="ssh-key-add-modal">
      <Form onSubmit={handleAdd}>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
        <Input
          label="Name"
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <Input
          label="Linux User"
          type="text"
          placeholder="ubuntu"
          value={user}
          onChange={(e) => {
            setUser(e.target.value);
          }}
        />

        <Label forId="source">Source</Label>
        <div className="p-segmented-control">
          <div
            className="p-segmented-control__list"
            id="source"
            role="tablist"
            aria-label="Source"
          >
            {segmentButton("clipboard", "Clipboard")}
            {segmentButton("fileUpload", "File upload")}
            {segmentButton("github", "Github")}
            {segmentButton("launchpad", "Launchpad")}
          </div>
        </div>

        <div className="source-input">
          {segmentContent(
            "clipboard",
            <AutoExpandingTextArea
              placeholder="ssh-rsa ..."
              help="Paste the contents of the public key file (.pub)"
              autoFocus
              cols={50}
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
              }}
            />,
          )}

          {segmentContent(
            "fileUpload",
            <Input
              type="file"
              accept=".pub"
              autoFocus
              onChange={(e) => {
                if (!e.target.files) {
                  return;
                }
                const file = e.target.files[0];

                // get file content as text
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    setSource(e.target.result as string);
                  }
                };
                reader.readAsText(file);
              }}
            />,
          )}

          {segmentContent(
            "github",
            <Input
              type="text"
              placeholder="Enter github username"
              help="Instance must have internet access to import SSH keys from Github."
              autoFocus
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
              }}
            />,
          )}

          {segmentContent(
            "launchpad",
            <Input
              type="text"
              placeholder="Enter launchpad username"
              help="Instance must have internet access to import SSH keys from Launchpad."
              autoFocus
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
              }}
            />,
          )}
        </div>
      </Form>

      <footer className="p-modal__footer" id="modal-footer">
        <Button appearance="" className="u-no-margin--bottom" onClick={onClose}>
          Cancel
        </Button>
        <Button
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={handleAdd}
          disabled={
            name.length === 0 || user.length === 0 || source.length === 0
          }
        >
          Add key
        </Button>
      </footer>
    </Modal>
  );
};
export default SshKeyAddModal;
