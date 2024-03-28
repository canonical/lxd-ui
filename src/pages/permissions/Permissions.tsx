import { FC, useState } from "react";
import { Row, SearchBox } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import HelpLink from "components/HelpLink";
import { useDocs } from "context/useDocs";
import { permissionsTabs } from "util/permissions";
import TabLinks from "components/TabLinks";
import { useParams } from "react-router-dom";
import PermissionIdentities from "./PermissionIdentities";
import PermissionGroups from "./PermissionGroups";
import CustomLayout from "components/CustomLayout";
import PageHeader from "components/PageHeader";
import IdentityProviderGroups from "./IdentityProviderGroups";

const Permissions: FC = () => {
  const docBaseLink = useDocs();
  const { activeTab } = useParams<{
    activeTab?: string;
  }>();
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [query, setQuery] = useState<string>("");

  return (
    <CustomLayout
      contentClassName="u-no-padding--bottom"
      header={
        <PageHeader>
          <PageHeader.Left>
            <PageHeader.Title>
              <HelpLink
                href={`${docBaseLink}/auth/permissions`}
                title="Learn more about permissions"
              >
                Permissions
              </HelpLink>
            </PageHeader.Title>
            {selectedNames.length === 0 && (
              <PageHeader.Search>
                <SearchBox
                  name={`search-${activeTab}`}
                  className="search-box u-no-margin--bottom"
                  type="text"
                  onChange={setQuery}
                  placeholder="Search"
                  value={query}
                  aria-label={`Search for ${activeTab}`}
                />
              </PageHeader.Search>
            )}
          </PageHeader.Left>
        </PageHeader>
      }
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={permissionsTabs}
          activeTab={activeTab}
          tabUrl={`/ui/permissions`}
        />

        {!activeTab && (
          <div role="tabpanel">
            <PermissionIdentities
              query={query}
              selectedNames={selectedNames}
              onSelectNames={setSelectedNames}
            />
          </div>
        )}

        {activeTab === "lxd-groups" && (
          <div role="tabpanel">
            <PermissionGroups
              query={query}
              selectedNames={selectedNames}
              onSelectNames={setSelectedNames}
            />
          </div>
        )}

        {activeTab === "idp-groups" && (
          <div role="tabpanel">
            <IdentityProviderGroups
              query={query}
              selectedNames={selectedNames}
              onSelectNames={setSelectedNames}
            />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default Permissions;
