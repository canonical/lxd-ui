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
  const isSmallOrMediumScreen = useIsScreenBelow(largeScreenBreakpoint);
  const classname = isSmallOrMediumScreen
    ? "p-contextual-menu__link"
    : undefined;

  const menuElements = [
    <OidcConfigurationBtn key="oidc-configuration" className={classname} />,
    <CreateTlsIdentityBtn
      key="create-identity"
      openPanel={openPanel}
      className={classname}
    />,
  ];

  return (
    <>
      {isSmallOrMediumScreen ? (
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
        <>{menuElements}</>
      )}
    </>
  );
};

export default PermissionIdentitiesActions;
