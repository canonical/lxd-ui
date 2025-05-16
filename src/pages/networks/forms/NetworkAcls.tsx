import type { FC } from "react";
import ExpandableList from "components/ExpandableList";
import type { FormikProps } from "formik/dist/types";
import type { NetworkFormValues } from "pages/networks/forms/NetworkForm";
import ResourceLink from "components/ResourceLink";
import FormEditButton from "components/FormEditButton";
import { ensureEditMode } from "util/instanceEdit";
import NetworkAclSelector from "pages/networks/forms/NetworkAclSelector";

interface Props {
  project: string;
  formik: FormikProps<NetworkFormValues>;
}

const NetworkAcls: FC<Props> = ({ formik, project }) => {
  return (
    <div className="general-field">
      <div className="general-field-label">ACLs</div>
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
                    to={`/ui/project/${project}/network-acl/${aclName}`}
                  />
                ))}
              />
            )}
            <FormEditButton
              toggleReadOnly={() => {
                ensureEditMode(formik);
                setTimeout(() => {
                  const selectWrapper = document.getElementById("acl-select");
                  // open multi select dropdown
                  selectWrapper?.scrollIntoView({ block: "nearest" });
                  (
                    selectWrapper?.firstChild?.firstChild as HTMLElement
                  )?.click();
                }, 100);
              }}
              disableReason={formik.values.editRestriction}
            />
          </>
        )}
        {!formik.values.readOnly && (
          <div id="acl-select">
            <NetworkAclSelector
              project={project}
              selectedAcls={formik.values.security_acls}
              setSelectedAcls={(selectedItems) => {
                formik.setFieldValue("security_acls", selectedItems);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkAcls;
