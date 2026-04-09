import type { FC } from "react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { RenameHeaderValues } from "components/RenameHeader";
import RenameHeader from "components/RenameHeader";
import { useFormik } from "formik";
import * as Yup from "yup";
import { checkDuplicateName } from "util/helpers";
import { ROOT_PATH } from "util/rootPath";
import type { LxdNetwork } from "types/network";
import { renameNetwork } from "api/networks";
import DeleteNetworkBtn from "pages/networks/actions/DeleteNetworkBtn";
import { useNotify, useToastNotification } from "@canonical/react-components";
import { useNetworkEntitlements } from "util/entitlements/networks";
import { useSupportedFeatures } from "context/useSupportedFeatures";
import { useEventQueue } from "context/eventQueue";
import NetworkRichChip from "./NetworkRichChip";
import ClusterMemberRichChip from "pages/cluster/ClusterMemberRichChip";

interface Props {
  name: string;
  network?: LxdNetwork;
  project: string;
}

const NetworkDetailHeader: FC<Props> = ({ name, network, project }) => {
  const { member } = useParams<{ member: string }>();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const controllerState = useState<AbortController | null>(null);
  const { canEditNetwork } = useNetworkEntitlements();
  const { hasStorageAndNetworkOperations } = useSupportedFeatures();
  const eventQueue = useEventQueue();

  const RenameSchema = Yup.object().shape({
    name: Yup.string()
      .test(
        "deduplicate",
        "A network with this name already exists",
        async (value) =>
          network?.name === value ||
          checkDuplicateName(value, project, controllerState, "networks"),
      )
      .required("Network name is required"),
  });

  const onSuccess = (networkName: string) => {
    const url = `${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/network/${encodeURIComponent(networkName)}`;
    navigate(url);
    toastNotify.success(
      <>
        Network <strong>{name}</strong> renamed to{" "}
        <NetworkRichChip networkName={networkName} projectName={project} />
      </>,
    );
    formik.setFieldValue("isRenaming", false);
  };

  const onFailure = (networkName: string, e: unknown) => {
    notify.failure(`Renaming of network ${networkName} failed`, e);
  };

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
      renameNetwork(name, values.name, project)
        .then((operation) => {
          if (hasStorageAndNetworkOperations) {
            toastNotify.info(
              <>
                Renaming of network{" "}
                <NetworkRichChip
                  networkName={values.name}
                  projectName={project}
                />{" "}
                has started.
              </>,
            );
            eventQueue.set(
              operation.metadata.id,
              () => {
                onSuccess(values.name);
              },
              (msg) => {
                onFailure(values.name, new Error(msg));
              },
            );
          } else {
            onSuccess(values.name);
          }
        })
        .catch((e) => {
          onFailure(values.name, e);
        })
        .finally(() => {
          formik.setSubmitting(false);
        });
    },
  });

  const isUsed = (network?.used_by?.length ?? 0) > 0;
  const isManaged = network?.managed;

  const getRenameDisableReason = () => {
    if (!canEditNetwork(network)) {
      return "You do not have permission to rename this network";
    }

    if (!isManaged) {
      return "Can not rename, network is not managed";
    }

    if (isUsed) {
      return "Can not rename, network is currently in use.";
    }

    return undefined;
  };

  return (
    <RenameHeader
      name={name}
      relatedChip={member && <ClusterMemberRichChip clusterMember={member} />}
      parentItems={[
        <Link
          to={`${ROOT_PATH}/ui/project/${encodeURIComponent(project)}/networks`}
          key={1}
        >
          Networks
        </Link>,
      ]}
      renameDisabledReason={getRenameDisableReason()}
      controls={
        network && <DeleteNetworkBtn network={network} project={project} />
      }
      isLoaded={Boolean(network)}
      formik={formik}
    />
  );
};

export default NetworkDetailHeader;
