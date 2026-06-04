import type { FC, ReactNode } from "react";
import { Icon, Spinner } from "@canonical/react-components";
import classnames from "classnames";

export interface PreflightCheck {
  id: string;
  label: ReactNode;
  status: "pass" | "fail" | "loading";
  message?: ReactNode;
}

interface RunReplicatorPreflightCheckRowProps {
  check: PreflightCheck;
}

const RunReplicatorPreflightCheckRow: FC<
  RunReplicatorPreflightCheckRowProps
> = ({ check }) => {
  const getIcon = () => {
    if (check.status === "loading") {
      return <Spinner />;
    }
    if (check.status === "pass") {
      return <Icon name="success" />;
    }
    if (check.status === "fail") {
      return <Icon name="error" />;
    }
    return null;
  };

  return (
    <div className="preflight-check-row">
      <div className="u-flex u-gap--small">
        {getIcon()}
        <p
          className={classnames("u-no-padding--top", "u-no-margin--bottom", {
            "u-text--muted": check.status === "loading",
          })}
        >
          {check.label}
        </p>
      </div>
      {check.message && check.status === "fail" && (
        <p className="preflight-check-row-error-message u-text--muted u-no-padding--top u-no-margin--bottom">
          {check.message}
        </p>
      )}
    </div>
  );
};

export default RunReplicatorPreflightCheckRow;
