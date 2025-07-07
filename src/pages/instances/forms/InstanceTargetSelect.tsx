import type { FC } from "react";
import { useRef } from "react";
import {
  CustomSelect,
  Input,
  Select,
  Spinner,
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
import { Link } from "react-router-dom";

interface Props {
  formik: FormikProps<CreateInstanceFormValues>;
}

const selectedType = (values: CreateInstanceFormValues) => {
  if (values.target?.startsWith("@")) {
    return "clusterGroup";
  }
  if (values.target) {
    return "clusterMember";
  }
  if (values.placementGroup !== undefined) {
    return "placementGroup";
  }
  return "auto";
};

const selectedClusterGroup = (target?: string) => {
  if (!target?.startsWith("@")) {
    return "";
  }
  return target.split("@")[1];
};

const selectedClusterMember = (target?: string) => {
  if (!target || target.startsWith("@")) {
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
  const placementGroupOptions = placementGroups.map((group) => ({
    label: (
      <div className="label">
        <span className="name">{group.name}</span>
        <span className="policy">{group.config.policy}</span>
        <span className="rigor">{group.config.rigor}</span>
      </div>
    ),
    text: `${group.name} (${group.config.policy}, ${group.config.rigor})`,
    value: group.name,
  }));

  const setAuto = () => {
    formik.setFieldValue("target", undefined);
    formik.setFieldValue("placementGroup", undefined);
  };

  const setClusterGroup = (group: string) => {
    formik.setFieldValue("target", `@${group}`);
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
        label="Target"
        wrapperClassName="select-input"
        value={type}
        options={[
          {
            label: "Auto",
            value: "auto",
          },
          {
            label: "Cluster group",
            value: "clusterGroup",
            disabled: clusterGroupOptions.length === 0,
          },
          {
            label: "Cluster member",
            value: "clusterMember",
            disabled:
              clusterMemberOptions.length === 0 ||
              isProjectBlockingClusterMemberTargeting,
          },
          {
            label: "Placement group",
            value: "placementGroup",
          },
        ]}
        onChange={(e) => {
          const type = e.target.value;
          if (type === "auto") {
            setAuto();
          }
          if (type === "clusterGroup") {
            setClusterGroup(clusterGroupOptions[0].value);
            setTimeout(() => clusterGroupRef.current?.open(), 100);
          }
          if (type === "clusterMember") {
            setClusterMember(clusterMemberOptions[0].value);
            setTimeout(() => clusterMemberRef.current?.open(), 100);
          }
          if (type === "placementGroup") {
            setPlacementGroup(placementGroupOptions[0]?.value ?? "");
            if (placementGroupOptions.length > 0) {
              setTimeout(() => placementGroupRef.current?.open(), 100);
            }
          }
        }}
        disabled={!formik.values.image}
        title={missingImageTitle}
      />
      {type === "clusterGroup" && (
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
      {type === "clusterMember" && (
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
      {type === "placementGroup" && (
        <CustomSelect
          id="placementGroup"
          label="Placement group"
          wrapperClassName="select-input"
          dropdownClassName="instance-target-dropdown"
          selectRef={placementGroupRef as SelectRef}
          onChange={setPlacementGroup}
          value={formik.values.placementGroup ?? ""}
          header={
            <div className="header">
              <span className="name">Name</span>
              <span className="policy">Policy</span>
              <span className="rigor">Rigor</span>
            </div>
          }
          help={
            <>
              Manage{" "}
              <Link
                to={`/ui/project/${project?.name ?? "default"}/placement-groups`}
                target="_blank"
              >
                placement groups
              </Link>{" "}
              for this project.
            </>
          }
          options={placementGroupOptions}
          disabled={!formik.values.image}
        />
      )}
    </div>
  );
};

export default InstanceTargetSelect;
