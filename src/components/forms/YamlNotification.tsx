import { FC, useState } from "react";
import { Notification } from "@canonical/react-components";
import { pluralize } from "util/instanceBulkActions";

const loadClosed = (entity: string) => {
  const saved = localStorage.getItem(`yamlNotificationClosed${entity}`);
  return Boolean(saved);
};

const saveClosed = (entity: string) => {
  localStorage.setItem(`yamlNotificationClosed${entity}`, "yes");
};

interface Props {
  entity: string;
  href: string;
}

const YamlNotification: FC<Props> = ({ entity, href }) => {
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
    >
      This is the YAML representation of the {entity}.
      <br />
      <a href={href} target="_blank" rel="noopener noreferrer">
        Learn more about {pluralize(entity, 2)}
      </a>
    </Notification>
  );
};

export default YamlNotification;
