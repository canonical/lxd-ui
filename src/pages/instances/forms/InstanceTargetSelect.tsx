import type { FC } from "react";
import { useRef } from "react";
import {
  CustomSelect,
  Icon,
  Input,
  Select,
  Spinner,
  Tooltip,
} from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import { useIsClustered } from "context/useIsClustered";
import { useCurrentProject } from "context/useCurrentProject";
import { useServerEntitlements } from "util/entitlements/server";
import { useClusterGroups } from "context/useClusterGroups";
import { usePlacementGroups } from "context/usePlacementGroups";
import { pluralize } from "util/instanceBulkActions";
import { useClusterMembers } from "context/useClusterMembers";
import type { SelectRef } from "@canonical/react-components/dist/components/CustomSelect/CustomSelect";
import PlacementGroupSelect from "pages/instances/forms/PlacementGroupSelect";
import { PLACEMENT_GROUP_POLICY_COMPACT } from "pages/placement-groups/PlacementGroupForm";

export const TARGET = {
  AUTO: "auto",
  CLUSTER_GROUP: "clusterGroup",
  CLUSTER_MEMBER: "clusterMember",
  PLACEMENT_GROUP: "placementGroup",
};

export const CLUSTER_GROUP_PREFIX = "@";

interface Props {
  formik: FormikProps<CreateInstanceFormValues>;
}

const selectedType = (values: CreateInstanceFormValues) => {
  if (values.target?.startsWith(CLUSTER_GROUP_PREFIX)) {
    return TARGET.CLUSTER_GROUP;
  }
  if (values.placementGroup) {
    return TARGET.PLACEMENT_GROUP;
  }
  if (values.target) {
    return TARGET.CLUSTER_MEMBER;
  }
  return TARGET.AUTO;
};

const selectedClusterGroup = (target?: string) => {
  if (!target?.startsWith(CLUSTER_GROUP_PREFIX)) {
    return "";
  }
  return target.split(CLUSTER_GROUP_PREFIX)[1];
};

const selectedClusterMember = (target?: string) => {
  if (!target || target.startsWith(CLUSTER_GROUP_PREFIX)) {
    return "";
  }
  return target;
};

const InstanceTargetSelect: FC<Props> = ({ formik }) => {
  const isClustered = useIsClustered();
  if (!isClustered) {
    return <></>;
  }

  const { canOverrideClusterTargetRestriction } = useServerEntitlements();
  const { project } = useCurrentProject();
  const type = selectedType(formik.values);
  const clusterMemberRef = useRef<SelectRef["current"]>(null);
  const clusterGroupRef = useRef<SelectRef["current"]>(null);
  const placementGroupRef = useRef<SelectRef["current"]>(null);

  const { data: clusterGroups = [], isLoading } = useClusterGroups();
  const isProjectRestricted = project?.config["restricted"] === "true";
  const restrictedGroups = project?.config["restricted.cluster.groups"];
  const clusterGroupOptions = clusterGroups
    .filter((group) => {
      if (group.members.length < 1) {
        return false;
      }
      if (isProjectRestricted && restrictedGroups) {
        return restrictedGroups.includes(group.name);
      } else {
        return true;
      }
    })
    .map((group) => {
      return {
        label: (
          <div className="label">
            <span className="name">{group.name}</span>
            <span className="members">{group.members.length}</span>
          </div>
        ),
        text: `${group.name} (${group.members.length} ${pluralize("member", group.members.length)})`,
        value: group.name,
      };
    });

  const { data: clusterMembers = [] } = useClusterMembers();
  const clusterMemberOptions = clusterMembers.map((member) => {
    return {
      label: member.server_name,
      value: member.server_name,
    };
  });

  const { data: placementGroups = [] } = usePlacementGroups(
    project?.name ?? "default",
  );

  const setAuto = () => {
    formik.setFieldValue("target", undefined);
    formik.setFieldValue("placementGroup", undefined);
  };

  const setClusterGroup = (group: string) => {
    formik.setFieldValue("target", `${CLUSTER_GROUP_PREFIX}${group}`);
    if (formik.values.placementGroup) {
      formik.setFieldValue("placementGroup", undefined);
    }
  };

  const setClusterMember = (member: string) => {
    formik.setFieldValue("target", member);
    if (formik.values.placementGroup) {
      formik.setFieldValue("placementGroup", undefined);
    }
  };

  const setPlacementGroup = (group: string) => {
    formik.setFieldValue("placementGroup", group);
    if (formik.values.target) {
      formik.setFieldValue("target", undefined);
    }
  };

  const placementGroup = placementGroups.find(
    (item) => item.name === formik.values.placementGroup,
  );
  const canAnchorPlacementGroup =
    placementGroup &&
    placementGroup.used_by.length === 0 &&
    placementGroup.config.policy === PLACEMENT_GROUP_POLICY_COMPACT;

  const clusterTarget = project?.config["restricted.cluster.target"];
  const isProjectBlockingClusterMemberTargeting =
    isProjectRestricted &&
    !canOverrideClusterTargetRestriction() &&
    (clusterTarget === "block" || clusterTarget === undefined); // the default on restricted projects is to block, so we also check for clusterTarget as undefined

  const isPreselected = (formik.values as { targetSelectedByVolume?: boolean })
    .targetSelectedByVolume;

  if (isLoading) {
    return <Spinner className="u-loader" text="Loading..." />;
  }

  if (isPreselected) {
    return (
      <Input
        id="clusterMember"
        label="Cluster member"
        value={formik.values.target}
        disabled
        help="Member is determined by the selected ISO volume and can't be changed."
        type="text"
      />
    );
  }

  const missingImageTitle = formik.values.image
    ? undefined
    : "Please select an image before adding a placement group";

  return (
    <div className="instance-target-selector">
      <Select
        id="target"
        label={
          <>
            Target{" "}
            <Tooltip
              message={`LXD automatically selects a cluster member for the instance.\nPlacement groups allow you to control how instances are distributed across cluster members.`}
            >
              <Icon name="information" />
            </Tooltip>
          </>
        }
        wrapperClassName="select-input"
        value={type}
        options={[
          {
            label: "Auto",
            value: TARGET.AUTO,
          },
          {
            label: "Cluster group",
            value: TARGET.CLUSTER_GROUP,
            disabled: clusterGroupOptions.length === 0,
          },
          {
            label: "Cluster member",
            value: TARGET.CLUSTER_MEMBER,
            disabled:
              clusterMemberOptions.length === 0 ||
              isProjectBlockingClusterMemberTargeting,
          },
          {
            label: "Placement group",
            value: TARGET.PLACEMENT_GROUP,
          },
        ]}
        onChange={(e) => {
          const type = e.target.value;
          if (type === TARGET.AUTO) {
            setAuto();
          }
          if (type === TARGET.CLUSTER_GROUP) {
            setClusterGroup(clusterGroupOptions[0].value);
            setTimeout(() => clusterGroupRef.current?.open(), 100);
          }
          if (type === TARGET.CLUSTER_MEMBER) {
            setClusterMember(clusterMemberOptions[0].value);
            setTimeout(() => clusterMemberRef.current?.open(), 100);
          }
          if (type === TARGET.PLACEMENT_GROUP) {
            setPlacementGroup(placementGroups[0]?.name ?? "-");
            if (placementGroups.length > 0) {
              setTimeout(() => placementGroupRef.current?.open(), 100);
            }
          }
        }}
        disabled={!formik.values.image}
        error={
          type === TARGET.PLACEMENT_GROUP && placementGroups.length === 0
            ? "No placement groups found for this project."
            : ""
        }
        title={missingImageTitle}
      />
      {type === TARGET.CLUSTER_GROUP && (
        <CustomSelect
          id="clusterGroup"
          label="Cluster group"
          wrapperClassName="select-input"
          dropdownClassName="instance-target-dropdown"
          selectRef={clusterGroupRef as SelectRef}
          onChange={setClusterGroup}
          value={selectedClusterGroup(formik.values.target)}
          options={clusterGroupOptions}
          header={
            <div className="header">
              <span className="name">Name</span>
              <span className="members">Members</span>
            </div>
          }
          disabled={!formik.values.image}
        />
      )}
      {type === TARGET.CLUSTER_MEMBER && (
        <CustomSelect
          id="clusterMember"
          label="Cluster member"
          wrapperClassName="select-input"
          dropdownClassName="instance-target-dropdown"
          selectRef={clusterMemberRef as SelectRef}
          onChange={setClusterMember}
          value={selectedClusterMember(formik.values.target)}
          options={clusterMemberOptions}
          disabled={!formik.values.image}
        />
      )}
      {type === TARGET.PLACEMENT_GROUP && (
        <PlacementGroupSelect
          value={formik.values.placementGroup}
          setValue={setPlacementGroup}
          project={project?.name ?? "default"}
          ref={placementGroupRef as SelectRef}
          disabled={!formik.values.image}
          profileNames={formik.values.profiles}
          isCreateInstance
        />
      )}
      {canAnchorPlacementGroup && (
        <CustomSelect
          id="clusterMember"
          label="Anchor"
          wrapperClassName="select-input"
          dropdownClassName="instance-target-dropdown"
          selectRef={clusterMemberRef as SelectRef}
          onChange={(value) => {
            const target = value ?? undefined;
            formik.setFieldValue("target", target);
          }}
          value={selectedClusterMember(formik.values.target)}
          options={[{ label: "Auto", value: "" }].concat(
            ...clusterMemberOptions,
          )}
          disabled={!formik.values.image}
          help="Cluster member to anchor the placement group"
        />
      )}
    </div>
  );
};

export default InstanceTargetSelect;
