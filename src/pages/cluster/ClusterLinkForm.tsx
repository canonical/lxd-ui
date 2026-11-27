import { Form, Input, Label } from "@canonical/react-components";
import type { FC, ReactNode } from "react";
import DocLink from "components/DocLink";
import PanelSection from "components/PanelSection";
import GroupSelection from "pages/permissions/panels/GroupSelection";
import { useAuthGroups } from "context/useAuthGroups";
import type { FormikProps } from "formik/dist/types";
import ClusterLinkTokenInput from "pages/cluster/ClusterLinkTokenInput";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import {
  normalizeRemoteAddress,
  isBidirectional,
  isUnidirectional,
  isPublic,
} from "util/clusterLink";
import ClusterLinkDirectionSelection, {
  CLUSTER_LINK_TYPES,
} from "pages/cluster/ClusterLinkDirectionSelection";

interface Props {
  formik: FormikProps<ClusterLinkFormValues>;
  isNameLocked?: boolean;
  children?: ReactNode;
  onPublicDetailsChange?: () => void;
}

const ClusterLinkForm: FC<Props> = ({
  formik,
  isNameLocked,
  children,
  onPublicDetailsChange,
}) => {
  const { data: authGroups = [] } = useAuthGroups(
    isBidirectional(formik.values.type),
  );

  const selectedGroups = new Set(formik.values.authGroups);
  const initial = new Set(formik.values.initialAuthGroups);
  const removed = [...initial].filter((g) => !selectedGroups.has(g));
  const added = [...selectedGroups].filter((g) => !initial.has(g));
  const modifiedGroups = new Set([...removed, ...added]);
  const hasName = formik.values.name !== "";
  const linkType = CLUSTER_LINK_TYPES.find(
    (type) => type.value === formik.values.type,
  );

  return (
    <Form onSubmit={formik.handleSubmit} className="cluster-link-form">
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <PanelSection header="Link type" isFirst>
        {formik.values.isCreating ? (
          <ClusterLinkDirectionSelection
            value={formik.values.type}
            disabled={isNameLocked || formik.isSubmitting}
            onSelect={(type) => {
              void formik.setValues({
                ...formik.values,
                type,
                token: "",
                tokenType: undefined,
                remoteAddress: "",
              });
              void formik.setTouched({});
            }}
          />
        ) : (
          <>
            <p className="u-sv-1">{linkType?.label}</p>
            <p className="p-form-help-text">{linkType?.help}</p>
          </>
        )}
      </PanelSection>
      <PanelSection header="Details">
        {!formik.values.isCreating && (
          <Input
            label="Link name"
            type="text"
            value={formik.values.name}
            readOnly
          />
        )}
        {formik.values.isCreating && (
          <>
            {isPublic(formik.values.type) ? (
              <Input
                {...formik.getFieldProps("remoteAddress")}
                onChange={(e) => {
                  onPublicDetailsChange?.();
                  formik.handleChange(e);
                }}
                onBlur={(e) => {
                  void formik.setFieldValue(
                    "remoteAddress",
                    normalizeRemoteAddress(e.target.value),
                  );
                  formik.handleBlur(e);
                }}
                type="text"
                label="Remote address"
                placeholder="Enter address (for example 10.0.0.2:8443)"
                help="Address of the target LXD cluster. The port defaults to 8443."
                required
                disabled={formik.isSubmitting}
                error={
                  formik.touched.remoteAddress
                    ? formik.errors.remoteAddress
                    : null
                }
              />
            ) : (
              <ClusterLinkTokenInput formik={formik} />
            )}
            <Input
              {...formik.getFieldProps("name")}
              type="text"
              label="Link name"
              placeholder="Enter name"
              required
              help={
                isNameLocked
                  ? "The pending link was created with this name. To use another name, delete the pending link from the list."
                  : undefined
              }
              disabled={
                isNameLocked ||
                formik.isSubmitting ||
                (!formik.values.token &&
                  (isUnidirectional(formik.values.type) ||
                    (isBidirectional(formik.values.type) &&
                      formik.values.tokenType === "consume"))) ||
                (isBidirectional(formik.values.type) &&
                  !formik.values.tokenType) ||
                (isPublic(formik.values.type) && !formik.values.remoteAddress)
              }
              error={formik.touched.name ? formik.errors.name : null}
            />
          </>
        )}
        <Input
          {...formik.getFieldProps("description")}
          onChange={(e) => {
            onPublicDetailsChange?.();
            formik.handleChange(e);
          }}
          type="text"
          label="Description"
          placeholder="Enter description"
          disabled={!hasName || formik.isSubmitting}
          title={
            hasName
              ? undefined
              : "Please enter a name before adding a description"
          }
        />
        {children}
      </PanelSection>
      {isBidirectional(formik.values.type) && (
        <PanelSection header="Auth groups">
          <Label>Source</Label>
          <p className="p-form-help-text">
            Control the permissions that incoming requests have to act on this
            cluster.
            <br />
            <DocLink docPath="/howto/cluster_links_create/">
              Learn more about cluster link permissions in the docs.
            </DocLink>
          </p>
          <GroupSelection
            groups={authGroups}
            modifiedGroups={modifiedGroups}
            parentItemName="cluster link"
            parentItems={[{ name: formik.values.name }]}
            selectedGroups={selectedGroups}
            setSelectedGroups={(val, isUnselectAll) => {
              if (isUnselectAll) {
                formik.setFieldValue("authGroups", []);
              } else {
                formik.setFieldValue("authGroups", val);
              }
            }}
            toggleGroup={(group) => {
              const currentGroups = formik.values.authGroups;
              if (currentGroups.includes(group)) {
                formik.setFieldValue(
                  "authGroups",
                  currentGroups.filter((g) => g !== group),
                );
              } else {
                formik.setFieldValue("authGroups", [...currentGroups, group]);
              }
            }}
            scrollDependencies={[formik]}
            disabled={!hasName || formik.isSubmitting}
            hasScrollableTable={false}
          />
        </PanelSection>
      )}
    </Form>
  );
};

export default ClusterLinkForm;
