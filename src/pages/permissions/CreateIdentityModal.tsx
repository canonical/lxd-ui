import type { FC } from "react";
import { useState } from "react";
import ResourceLabel from "components/ResourceLabel";
import {
  Accordion,
  ActionButton,
  List,
  Modal,
  Notification,
  Tabs,
} from "@canonical/react-components";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import { Link } from "react-router-dom";

interface Props {
  onClose: () => void;
  token: string;
  identityName: string;
}

const CreateIdentityModal: FC<Props> = ({ onClose, token, identityName }) => {
  const [isConfirmed, setConfirmed] = useState(false);
  const [howToUseActiveTab, setHowToUseActiveTab] = useState("cli-tab");

  return (
    <Modal
      className="create-tls-identity"
      title={
        <>
          Identity{" "}
          <ResourceLabel
            type="certificate"
            value={identityName}
            bold
            truncate
          />{" "}
          created successfully
        </>
      }
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
            title="Your identity trust token"
            tooltipMessage="Copy token"
            onCopyButtonClick={() => {
              setConfirmed(true);
            }}
          />
          <Notification
            severity="caution"
            title="Copy the identity trust token"
          >
            You will need the token to authenticate your client. <br />
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
                        For use with the LXC command-line tool, run:
                        <CodeSnippetWithCopyButton
                          code={`lxc remote add ${location.hostname} ${token}`}
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
                          <>
                            Open an unauthenticated browser on{" "}
                            <Link to={location.origin}>{location.origin}</Link>.
                          </>,
                          <>
                            Select <b>Setup TLS login</b> and follow the
                            instructions to configure the browser certificate.
                          </>,
                          <>
                            Use this identity trust token to add the new browser
                            certificate to this server&apos;s trust store.
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

export default CreateIdentityModal;
