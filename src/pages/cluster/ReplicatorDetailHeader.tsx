import { useState, type FC } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useNotify, useToastNotification } from "@canonical/react-components";
import { renameReplicator } from "api/replicators";
import RenameHeader, { type RenameHeaderValues } from "components/RenameHeader";
import { useFormik } from "formik";
import ReplicatorDetailActions from "pages/cluster/actions/ReplicatorDetailActions";
import type { LxdReplicator } from "types/replicator";
import { useReplicatorEntitlements } from "util/entitlements/replicators";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import * as Yup from "yup";
import ReplicatorRichChip from "./ReplicatorRichChip";

interface Props {
  replicator: LxdReplicator;
}

const ReplicatorDetailHeader: FC<Props> = ({ replicator }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const { canEditReplicator } = useReplicatorEntitlements();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A replicator with this name already exists",
        async (value) =>
          replicator.name === value ||
          checkDuplicateName(value, "", controllerState, "replicators"),
      )
      .required("Replicator name is required"),
  });

  const getDisabledReason = () => {
    if (!canEditReplicator(replicator)) {
      return "You do not have permission to rename this replicator";
    }

    if (!replicator) {
      return "Invalid replicator: Cannot be renamed";
    }

    return undefined;
  };

  const onSuccess = (replicatorName: string) => {
    const url = `${ROOT_PATH}/ui/project/${encodeURIComponent(replicator.project)}/replicator/${encodeURIComponent(replicatorName)}`;
    navigate(url);
    toastNotify.success(
      <>
        Replicator <strong>{replicator.name}</strong> renamed to{" "}
        <ReplicatorRichChip
          replicator={replicatorName}
          project={replicator.project}
        />
      </>,
    );
  };

  const onFailure = (replicatorName: string, e: unknown) => {
    notify.failure(`Renaming of replicator ${replicatorName} failed`, e);
  };

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name: replicator.name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: async (values) => {
      if (replicator.name === values.name) {
        formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }

      try {
        await renameReplicator(replicator.name, values.name);
        onSuccess(values.name);
        formik.setFieldValue("isRenaming", false);
      } catch (e) {
        onFailure(values.name, e);
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  return (
    <RenameHeader
      name={replicator.name}
      parentItems={[
        <Link to={`${ROOT_PATH}/ui/cluster/replicators`} key={1}>
          Replicators
        </Link>,
      ]}
      controls={
        replicator && <ReplicatorDetailActions replicator={replicator} />
      }
      isLoaded={Boolean(replicator.name)}
      formik={formik}
      renameDisabledReason={getDisabledReason()}
    />
  );
};

export default ReplicatorDetailHeader;
