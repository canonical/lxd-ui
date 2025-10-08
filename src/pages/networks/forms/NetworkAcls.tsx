import { useId, type FC } from "react";
import ExpandableList from "components/ExpandableList";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ResourceLink from "components/ResourceLink";
import FormEditButton from "components/FormEditButton";
import { ensureEditMode } from "util/instanceEdit";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";
import { Label } from "@canonical/react-components";

interface Props {
  project: string;
  formik: FormikProps<NetworkFormValues>;
}

const NetworkAcls: FC<Props> = ({ formik, project }) => {
  const networlAclSelectorId = useId();

  return (
    <div className="general-field">
      {formik.values.readOnly ? (
        <div className="general-field-label">ACLs</div>
      ) : (
        <Label className="general-field-label" forId={networlAclSelectorId}>
          ACLs
        </Label>
      )}
      <div
        className="general-field-content"
        key={formik.values.readOnly ? "read" : "edit"}
      >
        {formik.values.readOnly && (
          <>
            {formik.values.security_acls.length === 0 ? (
              "-"
            ) : (
              <ExpandableList
                items={formik.values.security_acls.map((aclName) => (
                  <ResourceLink
                    key={aclName}
                    type="network-acl"
                    value={aclName}
                    to={`/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(aclName)}`}
                  />
                ))}
              />
            )}
            <FormEditButton
              toggleReadOnly={() => {
                ensureEditMode(formik);
                setTimeout(() => {
                  const aclSelector =
                    document.getElementById(networlAclSelectorId);
                  // open multi select dropdown
                  aclSelector?.scrollIntoView({
                    block: "nearest",
                    inline: "nearest",
                  });
                  aclSelector?.click();
                }, 100);
              }}
              disableReason={formik.values.editRestriction}
            />
          </>
        )}
        {!formik.values.readOnly && (
          <NetworkAclSelector
            project={project}
            selectedAcls={formik.values.security_acls}
            setSelectedAcls={(selectedItems) => {
              formik.setFieldValue("security_acls", selectedItems);
            }}
            id={networlAclSelectorId}
          />
        )}
      </div>
    </div>
  );
};

export default NetworkAcls;
