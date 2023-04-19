import React, { FC, ReactNode, useState } from "react";
import { Button, Input, Tooltip } from "@canonical/react-components";
import SubmitButton from "components/SubmitButton";

interface Props {
  name: string;
  link: ReactNode;
  centerControls?: ReactNode;
  controls?: ReactNode;
  isLoaded: boolean;
  renameDisabledReason?: string;
  onRename: (newName: string) => Promise<void>;
  isRenaming: boolean;
}

const RenameHeader: FC<Props> = ({
  name,
  link,
  centerControls,
  controls,
  isLoaded,
  onRename,
  renameDisabledReason,
  isRenaming,
}) => {
  const [newName, setNewName] = useState(name);
  const [isRename, setRename] = useState(false);
  const canRename = renameDisabledReason === undefined;

  const handleRename = () => {
    onRename(newName)
      .then(() => setRename(false))
      .catch(console.log);
  };

  return (
    <div className="p-panel__header rename-header">
      <h1 className="u-off-screen">{name}</h1>
      {isLoaded ? (
        <div className="p-panel__title">
          <nav
            key="breadcrumbs"
            className="p-breadcrumbs"
            aria-label="Breadcrumbs"
          >
            <ol className="p-breadcrumbs__items">
              <li className="p-breadcrumbs__item">{link}</li>
              {isRename ? (
                <li className="p-breadcrumbs__item rename">
                  <Input
                    autoFocus
                    className="u-no-margin--bottom name-input"
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && handleRename()}
                    type="text"
                    value={newName}
                  />
                  <Button
                    appearance="base"
                    className="cancel"
                    dense
                    onClick={handleRename}
                  >
                    Cancel
                  </Button>
                  <SubmitButton
                    isSubmitting={isRenaming}
                    isDisabled={false}
                    buttonLabel="Save"
                    onClick={handleRename}
                    dense
                  />
                </li>
              ) : (
                <li
                  className="p-breadcrumbs__item name u-truncate"
                  onClick={() => canRename && setRename(true)}
                  title={name}
                >
                  <Tooltip
                    message={!canRename && renameDisabledReason}
                    position="btm-left"
                  >
                    {name}
                  </Tooltip>
                </li>
              )}
            </ol>
          </nav>
          {!isRename && centerControls}
        </div>
      ) : (
        <h4 className="p-panel__title">{name}</h4>
      )}
      {isLoaded && !isRename && (
        <div className="p-panel__controls">{controls}</div>
      )}
    </div>
  );
};

export default RenameHeader;
