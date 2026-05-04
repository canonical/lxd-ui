import type { FC } from "react";
import { cloneElement } from "react";
import { ContextualMenu } from "@canonical/react-components";
import {
  largeScreenBreakpoint,
  useIsScreenBelow,
} from "context/useIsScreenBelow";
import OidcConfigurationBtn from "pages/permissions/OidcConfigurationBtn";
import CreateTlsIdentityBtn from "pages/permissions/CreateTlsIdentityBtn";

interface Props {
  openPanel: () => void;
}

const PermissionIdentitiesActions: FC<Props> = ({ openPanel }) => {
  const isSmallScreen = useIsScreenBelow(largeScreenBreakpoint);

  const classname = isSmallScreen
    ? "p-contextual-menu__link"
    : "p-segmented-control__button";

  const menuElements = [
    <OidcConfigurationBtn key="oidc" className={classname} />,
    <CreateTlsIdentityBtn
      key="create"
      openPanel={openPanel}
      className={classname}
    />,
  ];

  return (
    <>
      {isSmallScreen ? (
        <ContextualMenu
          closeOnOutsideClick={false}
          toggleLabel="Actions"
          position="left"
          hasToggleIcon
          title="actions"
          className="p-panel__controls"
        >
          {(close: () => void) => (
            <span>
              {[...menuElements].map((item) =>
                cloneElement(item, { onClose: close }),
              )}
            </span>
          )}
        </ContextualMenu>
      ) : (
        <div className="p-segmented-control">
          <div className="p-segmented-control__list">{menuElements}</div>
        </div>
      )}
    </>
  );
};

export default PermissionIdentitiesActions;
