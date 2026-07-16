import { useState, type FC, type ReactNode } from "react";
import ResourceLabel from "components/ResourceLabel";
import {
  Accordion,
  ActionButton,
  Modal,
  Notification,
  Tabs,
} from "@canonical/react-components";
import CodeSnippetWithCopyButton from "components/CodeSnippetWithCopyButton";
import ConfirmationCheckbox from "components/ConfirmationCheckbox";
import type { IdentityFormValues } from "types/forms/identity";
import { IDENTITY_TYPE } from "util/permissionIdentities";

interface Props {
  onClose: () => void;
  token: string;
  identity: IdentityFormValues;
  title: string;
  notification: string;
  howToUseCli?: ReactNode;
  howToUseUi?: ReactNode;
  titleSuffix?: string;
}

const CreateIdentityModal: FC<Props> = ({
  onClose,
  token,
  identity,
  title,
  notification,
  howToUseCli,
  howToUseUi,
  titleSuffix = "created successfully",
}) => {
  const [isConfirmed, setConfirmed] = useState(false);
  const [howToUseActiveTab, setHowToUseActiveTab] = useState("ui-tab");

  return (
    <Modal
      className="create-tls-identity"
      title={
        <>
          Identity{" "}
          <ResourceLabel
            type={
              identity.identityType === IDENTITY_TYPE.TLS
                ? "certificate"
                : "token-bearer"
            }
            value={identity.name}
            bold
            truncate
          />{" "}
          {titleSuffix}
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
            title={title}
            tooltipMessage="Copy token"
            onCopyButtonClick={() => {
              setConfirmed(true);
            }}
          />
          <Notification severity="caution" title={notification}>
            Make sure to copy it now as you will not be able to see this again.
          </Notification>
          <Accordion
            sections={[
              {
                title: "How to use it?",
                content:
                  Boolean(howToUseCli) && Boolean(howToUseUi) ? (
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
                      {howToUseActiveTab === "cli-tab" && howToUseCli}

                      {howToUseActiveTab === "ui-tab" && howToUseUi}
                    </>
                  ) : (
                    howToUseCli
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
