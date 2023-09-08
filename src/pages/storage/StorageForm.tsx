import React, { FC, useState } from "react";
import {
  Button,
  Col,
  Form,
  Input,
  Row,
  Select,
  useNotify,
} from "@canonical/react-components";
import { useFormik } from "formik";
import * as Yup from "yup";
import Aside from "components/Aside";
import PanelHeader from "components/PanelHeader";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "util/queryKeys";
import SubmitButton from "components/SubmitButton";
import usePanelParams from "util/usePanelParams";
import { LxdStoragePool } from "types/storage";
import { createStoragePool } from "api/storage-pools";
import { getSourceHelpForDriver, storageDrivers } from "util/storageOptions";
import ItemName from "components/ItemName";
import { testDuplicateName } from "util/storage";
import NotificationRow from "components/NotificationRow";

const StorageForm: FC = () => {
  const panelParams = usePanelParams();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const controllerState = useState<AbortController | null>(null);

  const StorageSchema = Yup.object().shape({
    name: Yup.string()
      .test(...testDuplicateName(panelParams.project, controllerState))
      .required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      driver: "zfs",
      source: "",
      size: "",
    },
    validationSchema: StorageSchema,
    onSubmit: ({ name, description, driver, source, size }) => {
      const storagePool: LxdStoragePool = {
        name,
        description,
        driver,
        source: driver !== "btrfs" ? source : undefined,
        config: {
          size: size ? `${size}GiB` : undefined,
        },
      };

      createStoragePool(storagePool, panelParams.project)
        .then(() => {
          void queryClient.invalidateQueries({
            queryKey: [queryKeys.storage],
          });
          notify.success(
            <>
              Storage <ItemName item={storagePool} bold /> created.
            </>
          );
          panelParams.clear();
        })
        .catch((e) => {
          formik.setSubmitting(false);
          notify.failure("Storage pool creation failed", e);
        });
    },
  });

  const submitForm = () => {
    void formik.submitForm();
  };

  return (
    <Aside>
      <div className="p-panel l-site">
        <PanelHeader
          title={<h2 className="p-heading--4">Create storage pool</h2>}
        />
        <div className="p-panel__content">
          <NotificationRow />
          <Row>
            <Form onSubmit={formik.handleSubmit} stacked>
              <Input
                id="name"
                name="name"
                type="text"
                label="Name"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.name}
                error={formik.touched.name ? formik.errors.name : null}
                required
                stacked
              />
              <Input
                id="description"
                name="description"
                type="text"
                label="Description"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.description}
                error={
                  formik.touched.description ? formik.errors.description : null
                }
                stacked
              />
              <Select
                id="driver"
                name="driver"
                help={
                  formik.values.driver === "zfs"
                    ? "ZFS gives best performance and reliability"
                    : undefined
                }
                label="Driver"
                options={storageDrivers}
                onChange={formik.handleChange}
                value={formik.values.driver}
                required
                stacked
              />
              <Input
                id="size"
                name="size"
                type="number"
                help="When left blank, defaults to 20% of free disk space. Default will be between 5GiB and 30GiB"
                label="Size in GiB"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.size}
                error={formik.touched.size ? formik.errors.size : null}
                stacked
              />
              <Input
                id="source"
                name="source"
                type="text"
                disabled={formik.values.driver === "btrfs"}
                help={getSourceHelpForDriver(formik.values.driver)}
                label="Source"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.source}
                error={formik.touched.source ? formik.errors.source : null}
                stacked
              />
            </Form>
          </Row>
        </div>
        <div className="l-footer--sticky p-bottom-controls">
          <hr />
          <Row className="u-align--right">
            <Col size={12}>
              <Button appearance="base" onClick={panelParams.clear}>
                Cancel
              </Button>
              <SubmitButton
                isSubmitting={formik.isSubmitting}
                isDisabled={!formik.isValid}
                onClick={submitForm}
                buttonLabel="Create"
              />
            </Col>
          </Row>
        </div>
      </div>
    </Aside>
  );
};

export default StorageForm;
