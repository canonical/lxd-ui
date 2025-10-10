import { Icon } from "@canonical/react-components";
import type { FC } from "react";
import { Link } from "react-router-dom";

interface Props {
  providerName: string;
  to: string;
}

const SsoProviderButton: FC<Props> = ({ providerName, to }: Props) => {
  return (
    <Link
      to={to}
      target="_blank"
      rel="noopener noreferrer"
      className="p-button has-icon sso-provider-link"
    >
      <span>{providerName}</span>
      <Icon name="external-link" />
    </Link>
  );
};

export default SsoProviderButton;
