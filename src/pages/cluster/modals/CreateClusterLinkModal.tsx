import { useState, type FC } from "react";
import {
  Accordion,
  ActionButton,
  Input,
  List,
  Modal,
  Notification,
  Tabs,
} from "@canonical/react-components";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import ClusterLinkRichChip from "../ClusterLinkRichChip";

interface Props {
  onClose: () => void;
  token: string;
  linkName: string;
}

const CreateClusterLinkModal: FC<Props> = ({ onClose, token, linkName }) => {
  const [isConfirmed, setConfirmed] = useState(false);
  const [howToUseActiveTab, setHowToUseActiveTab] = useState("ui-tab");
  const [clusterName, setClusterName] = useState(linkName);

  return (
    <Modal
      className="create-cluster-link"
      title={
        <>
          Cluster link <ClusterLinkRichChip clusterLink={linkName} /> created
        </>
      }
      buttonRow={[
        <ConfirmationCheckbox
          label="I have copied the token"
          confirmed={[isConfirmed, setConfirmed]}
          key="confirm-checkbox"
        />,
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
            tooltipMessage="Copy token"
            onCopyButtonClick={() => {
              setConfirmed(true);
            }}
          />
          <Notification severity="caution" title="Copy the trust token">
            The trust token can be used to establish the cluster link{" "}
            <ClusterLinkRichChip clusterLink={linkName} /> on the target
            cluster. <br />
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
                          code={`lxc cluster link create ${clusterName} --auth-group admins --token ${token}`}
                          tooltipMessage="Copy command"
                          className="u-no-margin--bottom"
                          onCopyButtonClick={() => {
                            setConfirmed(true);
                          }}
                        />
                        <Input
                          label="Cluster link name"
                          type="text"
                          help="Customize the cluster link name for the command above."
                          onChange={(e) => {
                            setClusterName(e.target.value);
                          }}
                          value={clusterName}
                        />
                      </>
                    )}

                    {howToUseActiveTab === "ui-tab" && (
                      <List
                        className="u-no-margin--bottom"
                        items={[
                          <>Open the target cluster UI.</>,
                          <>
                            Select <b>Clustering</b>, <b>Links</b>,{" "}
                            <b>Create link</b> and <b>I have a token</b>.
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
