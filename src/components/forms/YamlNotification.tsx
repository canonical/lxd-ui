import type { FC } from "react";
import { useState } from "react";
import { Notification } from "@canonical/react-components";
import { pluralize } from "util/instanceBulkActions";
import DocLink from "components/DocLink";

const loadClosed = (entity: string) => {
  const saved = localStorage.getItem(`yamlNotificationClosed${entity}`);
  return Boolean(saved);
};

const saveClosed = (entity: string) => {
  localStorage.setItem(`yamlNotificationClosed${entity}`, "yes");
};

interface Props {
  entity: string;
  docPath: string;
}

const YamlNotification: FC<Props> = ({ entity, docPath }) => {
  const [closed, setClosed] = useState(loadClosed(entity));

  if (closed) {
    return null;
  }

  const handleClose = () => {
    saveClosed(entity);
    setClosed(true);
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      // ensure the Yaml editor is resized after the notification is closed
    }, 250);
  };

  return (
    <Notification
      severity="information"
      title="YAML Configuration"
      onDismiss={handleClose}
      actions={[
        <DocLink docPath={docPath} key="learn-more-link">
          Learn more about {pluralize(entity, 2)}
        </DocLink>,
      ]}
    >
      This is the YAML representation of the {entity}.
    </Notification>
  );
};

export default YamlNotification;
