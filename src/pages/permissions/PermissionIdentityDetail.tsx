import { FC } from "react";
import { useParams } from "react-router-dom";
import { Row, useNotify } from "@canonical/react-components";
import NotificationRow from "components/NotificationRow";
import CustomLayout from "components/CustomLayout";
import TabLinks from "components/TabLinks";
import { TabLink } from "@canonical/react-components/dist/components/Tabs/Tabs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { fetchIdentity } from "api/permissions";
import Loader from "components/Loader";
import PermissionIdentityHeader from "./PermissionIdentityHeader";
import PermissionIdentityOverview from "./PermissionIdentityOverview";
import PermissionIdentityGroups from "./PermissionIdentityGroups";
import {
  decodeIdentityNameFromUrl,
  encodeIdentityNameForUrl,
} from "util/permissions";

const PermissionIdentityDetail: FC = () => {
  const { activeTab, name, authMethod } = useParams<{
    activeTab?: string;
    name?: string;
    authMethod?: string;
  }>();
  const notify = useNotify();
  const tabs: (string | TabLink)[] = ["Overview", "Groups"];
  const decodedName = decodeIdentityNameFromUrl(name || "");

  if (!decodedName || !authMethod) {
    return <>Missing identity details</>;
  }

  const {
    data: identity,
    error,
    isLoading,
  } = useQuery({
    queryKey: [queryKeys.identities, decodedName],
    queryFn: () => fetchIdentity(decodedName, authMethod),
  });

  if (error) {
    notify.failure("Loading identity details failed", error);
  }

  if (isLoading) {
    return <Loader text="Loading identity details..." />;
  } else if (!identity) {
    return <>Loading identity details failed</>;
  }

  const isTlsIdentity = identity.authentication_method === "tls";
  const validTabs = !isTlsIdentity ? tabs : ["Overview"];

  return (
    <CustomLayout
      header={<PermissionIdentityHeader identity={identity} />}
      contentClassName="detail-page"
    >
      <NotificationRow />
      <Row>
        <TabLinks
          tabs={validTabs}
          activeTab={activeTab}
          tabUrl={`/ui/permissions/identity/${authMethod}/${encodeIdentityNameForUrl(identity.name)}`}
        />

        {!activeTab && (
          <div role="tabpanel" aria-labelledby="overview">
            <PermissionIdentityOverview identity={identity} />
          </div>
        )}

        {activeTab === "groups" && (
          <div role="tabpanel" aria-labelledby="identity-groups">
            <PermissionIdentityGroups identity={identity} />
          </div>
        )}
      </Row>
    </CustomLayout>
  );
};

export default PermissionIdentityDetail;
