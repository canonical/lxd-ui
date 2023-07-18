import React, { FC, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DeleteInstanceBtn from "./actions/DeleteInstanceBtn";
import { LxdInstance } from "types/instance";
import RenameHeader, { RenameHeaderValues } from "components/RenameHeader";
import { renameInstance } from "api/instances";
import InstanceStateActions from "pages/instances/actions/InstanceStateActions";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { useNotify } from "@canonical/react-components";

interface Props {
  name: string;
  instance?: LxdInstance;
  project: string;
}

const InstanceDetailHeader: FC<Props> = ({ name, instance, project }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const controllerState = useState<AbortController | null>(null);

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "An instance with this name already exists",
        (value) =>
          instance?.name === value ||
          checkDuplicateName(value, project, controllerState, "instances")
      )
      .required("Instance name is required"),
  });

  const formik = useFormik<RenameHeaderValues>({
    initialValues: {
      name,
      isRenaming: false,
    },
    validationSchema: RenameSchema,
    onSubmit: (values) => {
      if (name === values.name) {
        void formik.setFieldValue("isRenaming", false);
        formik.setSubmitting(false);
        return;
      }
      renameInstance(name, values.name, project)
        .then(() => {
          navigate(
            `/ui/project/${project}/instances/detail/${values.name}`,
            notify.queue(notify.success("Instance renamed."))
          );
          void formik.setFieldValue("isRenaming", false);
        })
        .catch((e) => {
          notify.failure("Renaming failed", e);
        })
        .finally(() => formik.setSubmitting(false));
    },
  });

  return (
    <RenameHeader
      name={name}
      parentItem={
        <Link to={`/ui/project/${project}/instances`}>Instances</Link>
      }
      renameDisabledReason={
        instance?.status !== "Stopped"
          ? "Stop the instance to rename"
          : undefined
      }
      centerControls={
        instance ? (
          <div>
            <i className="status u-text--muted">{instance.status}</i>
            <InstanceStateActions key="state" instance={instance} />
          </div>
        ) : null
      }
      controls={
        instance ? <DeleteInstanceBtn key="delete" instance={instance} /> : null
      }
      isLoaded={Boolean(instance)}
      formik={formik}
    />
  );
};

export default InstanceDetailHeader;
