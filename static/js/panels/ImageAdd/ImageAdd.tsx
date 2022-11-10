import React, { FC, useState } from "react";
import { Row, Tabs } from "@canonical/react-components";
import NotificationRow from "../../components/NotificationRow";
import { Notification } from "../../types/notification";
import ImageAddQuick from "./ImageAddQuick";
import ImageAddCustom from "./ImageAddCustom";
import PanelHeader from "../../components/PanelHeader";
import Aside from "../../components/Aside";

const TAB_QUICK = "quick";
const TAB_CUSTOM = "custom";

const ImageAdd: FC = () => {
  const [tab, setTab] = useState(TAB_QUICK);
  const [notification, setNotification] = useState<Notification | null>(null);

  return (
    <Aside width="wide">
      <div className="p-panel">
        <PanelHeader title={<h4>Image import</h4>} />
        <div className="p-panel__content">
          <NotificationRow
            notification={notification}
            close={() => setNotification(null)}
          />
          <Row>
            <Tabs
              links={[
                {
                  active: tab === TAB_QUICK,
                  label: "Quick",
                  onClick: () => setTab(TAB_QUICK),
                },
                {
                  active: tab === TAB_CUSTOM,
                  label: "Custom",
                  onClick: () => setTab(TAB_CUSTOM),
                },
              ]}
            />
            {tab === TAB_QUICK && (
              <ImageAddQuick setNotification={setNotification} />
            )}
            {tab === TAB_CUSTOM && (
              <ImageAddCustom setNotification={setNotification} />
            )}
          </Row>
        </div>
      </div>
    </Aside>
  );
};

export default ImageAdd;
