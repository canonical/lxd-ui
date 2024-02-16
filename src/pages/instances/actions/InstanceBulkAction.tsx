import { FC, Fragment, ReactNode } from "react";
import {
  LxdInstance,
  LxdInstanceAction,
  LxdInstanceStatus,
} from "types/instance";
import {
  instanceAction,
  pluralize,
  statusLabel,
} from "util/instanceBulkActions";
import { ConfirmationButton, Icon } from "@canonical/react-components";

interface Props {
  action: LxdInstanceAction;
  confirmAppearance?: string;
  confirmExtra?: ReactNode;
  confirmLabel: string;
  icon: string;
  instances: LxdInstance[];
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const InstanceBulkAction: FC<Props> = ({
  action,
  confirmAppearance,
  confirmExtra,
  confirmLabel,
  icon,
  instances,
  isLoading,
  isDisabled,
  onClick,
}) => {
  const selectedStates = new Set(instances.map((item) => item.status));
  const hasDifferentStates = selectedStates.size > 1;
  const selectedSummary = hasDifferentStates ? (
    <>
      <b>{instances.length}</b> {pluralize("instance", instances.length)}{" "}
      selected:
      <br />
      <br />
    </>
  ) : null;

  const hasChangedStates = [...selectedStates].some(
    (state) => instanceAction(action, state) !== undefined,
  );

  const statusLine = (
    currentState: LxdInstanceStatus,
    desiredAction: LxdInstanceAction,
  ) => {
    const count = instances.filter(
      (instance) => instance.status === currentState,
    ).length;

    if (count === 0) {
      return null;
    }

    const status = statusLabel(currentState) ?? "";
    const actionRaw = instanceAction(desiredAction, currentState);

    if (actionRaw === undefined) {
      const instance = count === 1 ? "instance that is" : "instances that are";
      const already = desiredAction !== "restart" ? "already " : "";
      return (
        <Fragment key={currentState + desiredAction}>
          - No action for <b>{count}</b> {instance} {already}
          {currentState.toLowerCase()}.
          <br />
        </Fragment>
      );
    }

    const indent = hasDifferentStates ? "- " : "";

    return (
      <Fragment key={currentState + desiredAction}>
        {indent}
        This will {desiredAction} <b>{count}</b>
        {` ${status} ${pluralize("instance", count)}.`}
        <br />
      </Fragment>
    );
  };

  // no action states should be last
  const getLineOrder = (): LxdInstanceStatus[] => {
    switch (action) {
      case "start":
        return ["Frozen", "Stopped", "Running"];
      case "restart":
        return ["Running", "Freezing", "Stopped", "Frozen"];
      case "freeze":
        return ["Running", "Stopped", "Frozen"];
      case "stop":
        return ["Frozen", "Freezing", "Running", "Starting", "Stopped"];
      default:
        return [];
    }
  };

  return (
    <ConfirmationButton
      appearance="base"
      disabled={isDisabled || !hasChangedStates}
      loading={isLoading}
      className="u-no-margin--right u-no-margin--bottom bulk-action has-icon"
      confirmationModalProps={{
        title: `Confirm ${confirmLabel.toLowerCase()}`,
        children: (
          <p>
            {selectedSummary}
            {getLineOrder().map((state) => statusLine(state, action))}
          </p>
        ),
        confirmExtra: confirmExtra,
        onConfirm: onClick,
        confirmButtonLabel: confirmLabel,
        confirmButtonAppearance: confirmAppearance,
      }}
      shiftClickEnabled
      showShiftClickHint
    >
      <Icon name={icon} />
      <span>{confirmLabel}</span>
    </ConfirmationButton>
  );
};

export default InstanceBulkAction;
