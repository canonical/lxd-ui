import React, { FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import { useNotify } from "@canonical/react-components";
import SubmitButton from "components/SubmitButton";
import { useFormik } from "formik";
import NetworkForwardForm, {
  NetworkForwardFormValues,
  NetworkForwardSchema,
  toNetworkForward,
} from "pages/networks/forms/NetworkForwardForm";
import { createNetworkForward } from "api/network-forwards";
import { Link, useNavigate, useParams } from "react-router-dom";
import BaseLayout from "components/BaseLayout";
import { useDocs } from "context/useDocs";
import HelpLink from "components/HelpLink";
import FormFooterLayout from "components/forms/FormFooterLayout";
import { useToastNotification } from "context/toastNotificationProvider";

const CreateNetworkForward: FC = () => {
  const docBaseLink = useDocs();
  const navigate = useNavigate();
  const notify = useNotify();
  const toastNotify = useToastNotification();
  const queryClient = useQueryClient();
  const { network, project } = useParams<{
    network: string;
    project: string;
  }>();

  const formik = useFormik<NetworkForwardFormValues>({
    initialValues: {
      listenAddress: "",
      ports: [],
    },
    validationSchema: NetworkForwardSchema,
    onSubmit: (values) => {
      const forward = toNetworkForward(values);
      createNetworkForward(network ?? "", forward, project ?? "")
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [
              queryKeys.projects,
              project,
              queryKeys.networks,
              network,
              queryKeys.forwards,
            ],
          });
          navigate(
            `/ui/project/${project}/networks/detail/${network}/forwards`,
          );
          toastNotify.success(
            `Network forward ${forward.listen_address} created.`,
          );
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Network forward creation failed", e);
        });
    },
  });

  return (
    <BaseLayout
      title={
        <HelpLink
          href={`${docBaseLink}/howto/network_forwards/`}
          title="Learn more about network forwards"
        >
          Create a network forward
        </HelpLink>
      }
      contentClassName="create-network"
    >
      <NetworkForwardForm
        formik={formik}
        networkName={network ?? ""}
        project={project ?? ""}
      />
      <FormFooterLayout>
        <Link
          className="p-button--base"
          to={`/ui/project/${project}/networks/detail/${network}/forwards`}
        >
          Cancel
        </Link>
        <SubmitButton
          isSubmitting={formik.isSubmitting}
          isDisabled={!formik.isValid || !formik.values.listenAddress}
          buttonLabel="Create"
          onClick={() => void formik.submitForm()}
        />
      </FormFooterLayout>
    </BaseLayout>
  );
};

export default CreateNetworkForward;
