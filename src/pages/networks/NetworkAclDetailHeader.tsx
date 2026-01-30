import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import type { LxdNetworkAcl } from "types/network";
import { useNotify, useToastNotification } from "@canonical/react-components";
import ResourceLink from "components/ResourceLink";
import DeleteNetworkAclBtn from "pages/networks/actions/DeleteNetworkAclBtn";
import { useNetworkAclEntitlements } from "util/entitlements/network-acls";
import { renameNetworkAcl } from "api/network-acls";
import DownloadNetworkAclLogsBtn from "pages/networks/actions/DownloadNetworkAclLogsBtn";

interface Props {
  name: string;
  networkAcl?: LxdNetworkAcl;
  project: string;
}

const NetworkAclDetailHeader: FC<Props> = ({ name, networkAcl, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditNetworkAcl } = useNetworkAclEntitlements();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An ACL with this name already exists",
        async (value) =>
          networkAcl?.name === value ||
          checkDuplicateName(value, project, controllerState, "network-acls"),
      )
      .required("ACL name is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameNetworkAcl(name, values.name, project)
        .then(() => {
          const url = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acl/${encodeURIComponent(values.name)}`;
          navigate(url);
          toastNotify.success(
            <>
              Network ACL <strong>{name}</strong> renamed to{" "}
              <ResourceLink type="network-acl" value={values.name} to={url} />.
            </>,
          );
          formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const isUsed = (networkAcl?.used_by?.length ?? 0) > 0;

  const getRenameDisableReason = () => {
    if (!canEditNetworkAcl(networkAcl)) {
      return "You do not have permission to rename this ACL";
    }

    if (isUsed) {
      return "Can not rename, ACL is currently in use.";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={name}
      parentItems={[
        <Link
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network-acls`}
          key={1}
        >
          Network ACLs
        </Link>,
      ]}
      renameDisabledReason={getRenameDisableReason()}
      controls={
        networkAcl && (
          <>
            <DownloadNetworkAclLogsBtn
              networkAcl={networkAcl}
              project={project}
            />
            <DeleteNetworkAclBtn networkAcl={networkAcl} project={project} />
          </>
        )
      }
      isLoaded={Boolean(networkAcl)}
      formik={formik}
    />
  );
};

export default NetworkAclDetailHeader;
