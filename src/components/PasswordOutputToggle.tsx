import { useState, type FC } from "react";
import { Button, Icon, List } from "@canonical/react-components";
import CopyToClipboard from "components/CopyToClipboard";

interface Props {
  password?: string;
}

const PasswordOutputToggle: FC<Props> = ({ password }) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!password) {
    return null;
  }

  return (
    <div className="password-output-toggle u-flex">
      <span
        title={isRevealed ? password : undefined}
        className="password-output-toggle-value u-truncate"
      >
        <span aria-hidden={!isRevealed}>
          {isRevealed ? password : "\u2022".repeat(35)}
        </span>
        <span className="u-off-screen">
          {isRevealed ? "Password is revealed" : "Password is hidden"}
        </span>
      </span>
      <List
        inline
        className="u-no-margin--bottom password-output-toggle-actions-list"
        items={[
          <Button
            key="reveal"
            appearance="base"
            className="u-no-margin--bottom"
            dense
            hasIcon
            onClick={() => {
              setIsRevealed((prev) => !prev);
            }}
            aria-label={isRevealed ? "Hide password" : "Show password"}
            type="button"
          >
            <Icon name={isRevealed ? "hide" : "show"} />
          </Button>,
          <CopyToClipboard
            key="copy"
            value={password}
            tooltipMessage="Copy password"
          />,
        ]}
      />
    </div>
  );
};

export default PasswordOutputToggle;
