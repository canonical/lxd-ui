import type { FC } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Input, Select, Spinner } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { CreateInstanceFormValues } from "pages/instances/CreateInstance";
import { useIsClustered } from "context/useIsClustered";
import { useCurrentProject } from "context/useCurrentProject";
import { useServerEntitlements } from "util/entitlements/server";
import { useClusterGroups } from "context/useClusterGroups";

interface Props {
  formik: FormikProps<CreateInstanceFormValues>;
}

const figureDefaultGroup = (target?: string) => {
  if (!target?.startsWith("@")) {
    return "default";
  }
  return target.split("@")[1];
};

const figureDefaultMember = (target?: string) => {
  if (!target || target.startsWith("@")) {
    return "";
  }
  return target;
};

const InstanceLocationSelect: FC<Props> = ({ formik }) => {
  const isClustered = useIsClustered();
  const { canOverrideClusterTargetRestriction } = useServerEntitlements();

  if (!isClustered) {
    return <></>;
  }

  const defaultGroup = figureDefaultGroup(formik.values.target);
  const [selectedGroup, setSelectedGroup] = useState(defaultGroup);
  const defaultMember = figureDefaultMember(formik.values.target);
  const [selectedMember, setSelectedMember] = useState(defaultMember);
  const { project } = useCurrentProject();
  const { data: clusterGroups = [], isLoading } = useClusterGroups();

  const setGroup = (group: string) => {
    formik.setFieldValue("target", `@${group}`);
    setSelectedGroup(group);
    setSelectedMember("");
  };

  const setMember = (member: string) => {
    if (member === "") {
      setGroup(selectedGroup);
    } else {
      formik.setFieldValue("target", member);
      setSelectedMember(member);
    }
  };

  const availableMembers =
    clusterGroups.find((group) => group.name === selectedGroup)?.members ?? [];

  const isProjectRestricted = project?.config["restricted"] === "true";
  const clusterTarget = project?.config["restricted.cluster.target"];
  const isProjectBlockingClusterMemberTargeting =
    isProjectRestricted &&
    !canOverrideClusterTargetRestriction() &&
    (clusterTarget === "block" || clusterTarget === undefined); // the default on restricted projects is to block, so we also check for clusterTarget as undefined

  const isPreselected = (formik.values as { targetSelectedByVolume?: boolean })
    .targetSelectedByVolume;

  const availableGroups = clusterGroups.filter((group) => {
    const restrictedGroups = project?.config["restricted.cluster.groups"];
    if (isProjectRestricted && restrictedGroups) {
      return restrictedGroups.includes(group.name);
    } else {
      return true;
    }
  });

  useEffect(() => {
    const hasGroups = availableGroups.length > 0;
    const isSelectedGroupInvalid = !availableGroups
      .map((group) => group.name)
      .includes(selectedGroup);

    if (hasGroups && isSelectedGroupInvalid) {
      const validFirstGroup = availableGroups[0].name;
      setSelectedGroup(validFirstGroup);
    }
  }, [availableGroups, selectedGroup]);

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

  return (
    <>
      <Select
        id="clusterGroup"
        label="Cluster group"
        onChange={(e) => {
          setGroup(e.target.value);
        }}
        value={selectedGroup}
        options={availableGroups.map((group) => {
          return {
            label: group.name,
            value: group.name,
            disabled: group.members.length < 1,
          };
        })}
        disabled={!formik.values.image}
        title={
          formik.values.image
            ? ""
            : "Please select an image before adding a location group"
        }
      />
      <Select
        id="clusterMember"
        label="Cluster member"
        onChange={(e) => {
          setMember(e.target.value);
        }}
        value={selectedMember}
        options={[
          ...(availableMembers.length > 1 ? [{ label: "any", value: "" }] : []),
          ...availableMembers.map((member) => {
            return { label: member, value: member };
          }),
        ]}
        disabled={
          !formik.values.image || isProjectBlockingClusterMemberTargeting
        }
        title={
          isProjectBlockingClusterMemberTargeting
            ? "Cluster member targeting is blocked by project policy"
            : formik.values.image
              ? ""
              : "Please select an image before adding a location member"
        }
      />
    </>
  );
};

export default InstanceLocationSelect;
