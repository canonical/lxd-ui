import React, { FC } from "react";
import { Tabs } from "@canonical/react-components";
import { useNotify } from "@canonical/react-components";
import { useNavigate } from "react-router-dom";
import { slugify } from "util/slugify";

interface Props {
  tabs: string[];
  activeTab?: string;
  tabUrl: string;
}

const TabLinks: FC<Props> = ({ tabs, activeTab, tabUrl }) => {
  const notify = useNotify();
  const navigate = useNavigate();
  const tabsPath = tabs.map((tab) => slugify(tab));

  return (
    <Tabs
      links={tabs.map((tab, index) => {
        const tabPath = tabsPath[index];
        const href = tab === tabs[0] ? tabUrl : `${tabUrl}/${tabPath}`;

        return {
          label: tab,
          id: tabPath,
          active: tabPath === activeTab || (tab === tabs[0] && !activeTab),
          onClick: (e) => {
            e.preventDefault();
            notify.clear();
            navigate(href);
          },
          href,
        };
      })}
    />
  );
};

export default TabLinks;
