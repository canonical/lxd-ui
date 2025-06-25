import type { FC } from "react";
import { useState } from "react";
import {
  Accordion,
  ActionButton,
  List,
  Modal,
  Notification,
  Tabs,
} from "@canonical/react-components";
import ResourceLabel from "components/ResourceLabel";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";

interface Props {
  onClose: () => void;
  token: string;
  linkName: string;
}

const CreateClusterLinkModal: FC<Props> = ({ onClose, token, linkName }) => {
  const [isConfirmed, setConfirmed] = useState(false);
  const [howToUseActiveTab, setHowToUseActiveTab] = useState("cli-tab");

  return (
    <Modal
      close={onClose}
      className="create-cluster-link"
      title="Cluster link created"
      buttonRow={[
        <span className="u-float-left confirm-input" key="confirm-input">
          <ConfirmationCheckbox
            label="I have copied the token"
            confirmed={[isConfirmed, setConfirmed]}
          />
        </span>,
        <ActionButton
          key="confirm-action-button"
          appearance="positive"
          className="u-no-margin--bottom"
          onClick={onClose}
          disabled={!isConfirmed}
        >
          Done
        </ActionButton>,
      ]}
      closeOnOutsideClick={false}
    >
      {token && (
        <>
          <CodeSnippetWithCopyButton
            code={token}
            title="Your trust token"
            onCopyButtonClick={() => {
              setConfirmed(true);
            }}
          />
          <Notification severity="caution" title="Copy the trust token">
            The trust token can be used to establish the cluster link{" "}
            <ResourceLabel type="cluster-link" value={linkName} bold /> on the
            target cluster. <br />
            Make sure to copy it now as you will not be able to see this again.
          </Notification>
          <Accordion
            sections={[
              {
                title: "How to use it?",
                content: (
                  <>
                    <Tabs
                      links={[
                        {
                          label: "CLI",
                          active: howToUseActiveTab === "cli-tab",
                          onClick: () => {
                            setHowToUseActiveTab("cli-tab");
                          },
                        },
                        {
                          label: "UI",
                          active: howToUseActiveTab === "ui-tab",
                          onClick: () => {
                            setHowToUseActiveTab("ui-tab");
                          },
                        },
                      ]}
                    />
                    {howToUseActiveTab === "cli-tab" && (
                      <>
                        For use with the LXC command-line tool, run on the
                        target cluster:
                        <CodeSnippetWithCopyButton
                          code={`lxc cluster link create ${location.hostname} --auth-group admins --token ${token}`}
                          tooltipMessage="Copy command"
                          className="u-no-margin--bottom"
                        />
                        <span className="u-text--muted p-text--small u-sv3">
                          You can replace <code>{location.hostname}</code> with
                          a nickname for this server.
                        </span>
                      </>
                    )}

                    {howToUseActiveTab === "ui-tab" && (
                      <List
                        className="u-no-margin--bottom"
                        items={[
                          <>Open the target cluster UI.</>,
                          <>
                            Select <b>Clustering</b>, <b>Links</b>,{" "}
                            <b>Create link</b> and <b>Consume token</b>.
                          </>,
                          <>
                            Use this trust token to establish the cluster link.
                          </>,
                        ]}
                      />
                    )}
                  </>
                ),
              },
            ]}
          />
        </>
      )}
    </Modal>
  );
};

export default CreateClusterLinkModal;
