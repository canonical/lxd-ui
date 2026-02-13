import type { FC } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { ContextualMenu } from "@canonical/react-components";
import {
  isAltPressed,
  isCtrlPressed,
  sendAltF4,
  sendAltTab,
  sendCtrlAltDel,
  sendF1,
  sendF2,
  sendF3,
  sendF4,
  sendF5,
  sendF6,
  sendF7,
  sendF8,
  sendF9,
  sendF10,
  sendF11,
  sendF12,
  sendPrintScreen,
  toggleAlt,
  toggleCtrl,
} from "lib/spice/src/inputs.js";

interface Props {
  disabled?: boolean;
}

const InstanceConsoleShortcuts: FC<Props> = ({ disabled }) => {
  const [isAlt, setIsAlt] = useState(false);
  const [isCtrl, setIsCtrl] = useState(false);

  const updateKeys = () => {
    const newAlt = isAltPressed(window.spice_connection);
    const newCtrl = isCtrlPressed(window.spice_connection);
    if (newAlt !== isAlt) {
      setIsAlt(newAlt);
    }
    if (newCtrl !== isCtrl) {
      setIsCtrl(newCtrl);
    }
  };

  useEffect(() => {
    // Update the key states every second to reflect any changes within the spice connection
    const interval = setInterval(updateKeys, 500);
    return () => {
      clearInterval(interval);
    };
  });

  const handleAlt = () => {
    toggleAlt(window.spice_connection);
  };

  const handleCtrl = () => {
    toggleCtrl(window.spice_connection);
  };

  return (
    <ContextualMenu
      hasToggleIcon
      toggleLabel="Shortcuts"
      toggleClassName="u-no-margin--bottom"
      toggleDisabled={disabled}
      toggleProps={{
        title: disabled ? "Start the instance to access shortcuts" : undefined,
      }}
      dropdownClassName="instance-console-shortcut-dropdown"
      links={[
        {
          children: isAlt ? "Release and unlock Alt" : "Hold and lock Alt",
          onClick: handleAlt,
        },
        {
          children: isCtrl ? "Release and unlock Ctrl" : "Hold and lock Ctrl",
          onClick: handleCtrl,
        },
        {
          children: "Send Ctrl + Alt + Del",
          onClick: () => {
            sendCtrlAltDel(window.spice_connection);
          },
        },
        {
          children: "Send Alt + Tab",
          onClick: () => {
            sendAltTab(window.spice_connection);
          },
        },
        {
          children: "Send Alt + F4",
          onClick: () => {
            sendAltF4(window.spice_connection);
          },
        },
        {
          children: "Send Print Screen",
          onClick: () => {
            sendPrintScreen(window.spice_connection);
          },
        },
        {
          children: "Send F1",
          onClick: () => {
            sendF1(window.spice_connection);
          },
        },
        {
          children: "Send F2",
          onClick: () => {
            sendF2(window.spice_connection);
          },
        },
        {
          children: "Send F3",
          onClick: () => {
            sendF3(window.spice_connection);
          },
        },
        {
          children: "Send F4",
          onClick: () => {
            sendF4(window.spice_connection);
          },
        },
        {
          children: "Send F5",
          onClick: () => {
            sendF5(window.spice_connection);
          },
        },
        {
          children: "Send F6",
          onClick: () => {
            sendF6(window.spice_connection);
          },
        },
        {
          children: "Send F7",
          onClick: () => {
            sendF7(window.spice_connection);
          },
        },
        {
          children: "Send F8",
          onClick: () => {
            sendF8(window.spice_connection);
          },
        },
        {
          children: "Send F9",
          onClick: () => {
            sendF9(window.spice_connection);
          },
        },
        {
          children: "Send F10",
          onClick: () => {
            sendF10(window.spice_connection);
          },
        },
        {
          children: "Send F11",
          onClick: () => {
            sendF11(window.spice_connection);
          },
        },
        {
          children: "Send F12",
          onClick: () => {
            sendF12(window.spice_connection);
          },
        },
      ]}
    />
  );
};

export default InstanceConsoleShortcuts;
