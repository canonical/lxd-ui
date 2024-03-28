import { FC } from "react";
import { useParams } from "react-router-dom";
import { Row, useNotify } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";
import { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import PermissionGroupHeader from "./PermissionGroupHeader";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchIdpGroup } from "api/permissions";
import Loader from "components/Loader";
import IdentityProviderGroupOverview from "./IdentityProviderGroupOverview";
import EditIdentityProviderGroup from "./EditIdentityProviderGroup";

const IdentityProviderGroupDetail: FC = () => {
  const { activeTab, name } = useParams<{
    activeTab?: string;
    name?: string;
  }>();
  const notify = useNotify();
  const tabs: (string | TabLink)[] = ["Overview", "Configuration"];

  if (!name) {
    return <>Missing name</>;
  }

  const {
    data: group,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.idpGroups, name],
    queryFn: () => fetchIdpGroup(name),
  });

  if (error) {
    notify.failure("Loading idp group details failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading idp group details..." />;
  } else if (!group) {
    return <>Loading idp group details failed</>;
  }

  return (
    <CustomLayout
      header={<PermissionGroupHeader group={group} groupType="idp-groups" />}
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={tabs}
          activeTab={activeTab}
          tabUrl={`/ui/permissions/idp-group/${name}`}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <IdentityProviderGroupOverview group={group} />
          </div>
        )}

        {activeTab === "configuration" && (
          <div role="tabpanel" aria-labelledby="configuration">
            <EditIdentityProviderGroup group={group} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default IdentityProviderGroupDetail;
