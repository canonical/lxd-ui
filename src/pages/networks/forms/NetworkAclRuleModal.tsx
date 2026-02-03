import type { FC } from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  Select,
} from "@canonical/react-components";
import { useFormik } from "formik";
import type { RuleDirection } from "pages/networks/forms/NetworkAclForm";
import type { NetworkAclRuleFormValues } from "types/forms/networkAcl";

interface Props {
  direction: RuleDirection;
  onClose: () => void;
  onAdd: (values: NetworkAclRuleFormValues) => void;
  editRule: NetworkAclRuleFormValues | null;
}

const NetworkAclRuleModal: FC<Props> = ({
  direction,
  onClose,
  onAdd,
  editRule,
}) => {
  const formik = useFormik<NetworkAclRuleFormValues>({
    initialValues: editRule
      ? editRule
      : {
          protocol: "tcp",
          action: "allow",
          state: "enabled",
        },
    enableReinitialize: true,
    onSubmit: (values) => {
      onAdd(values);
    },
  });

  return (
    <Modal
      close={onClose}
      title={editRule ? `Update ${direction} rule` : `Add ${direction} rule`}
      buttonRow={
        <>
          <Button className="u-no-margin--bottom" onClick={onClose}>
            Cancel
          </Button>
          <Button
            appearance="positive"
            className="u-no-margin--bottom"
            onClick={formik.submitForm}
          >
            {editRule ? "Update rule" : "Add rule"}
          </Button>
        </>
      }
    >
      <Form onSubmit={formik.handleSubmit}>
        {/* hidden submit to enable enter key in inputs */}
        <Input type="submit" hidden value="Hidden input" />
        <Select
          id="action"
          label="Action"
          options={[
            { label: "Allow", value: "allow" },
            { label: "Reject", value: "reject" },
            { label: "Drop", value: "drop" },
          ]}
          {...formik.getFieldProps("action")}
        />
        <Select
          id="state"
          label="State"
          options={[
            { label: "Enabled", value: "enabled" },
            { label: "Disabled", value: "disabled" },
            { label: "Logged", value: "logged" },
          ]}
          help="Possible values are enabled, disabled, and logged."
          {...formik.getFieldProps("state")}
        />
        <Input
          id="description"
          label="Description"
          type="text"
          placeholder="Enter description"
          {...formik.getFieldProps("description")}
        />
        <Select
          id="protocol"
          label="Protocol"
          options={[
            { label: "Any", value: "" },
            { label: "ICMP4", value: "icmp4" },
            { label: "ICMP6", value: "icmp6" },
            { label: "TCP", value: "tcp" },
            { label: "UDP", value: "udp" },
          ]}
          onBlur={formik.handleBlur}
          onChange={(e) => {
            if (e.target.value !== "tcp" && e.target.value !== "udp") {
              formik.setFieldValue("source_port", undefined);
              formik.setFieldValue("destination_port", undefined);
            }
            if (e.target.value !== "icmp4" && e.target.value !== "icmp6") {
              formik.setFieldValue("icmp_code", undefined);
              formik.setFieldValue("icmp_type", undefined);
            }
            formik.handleChange(e);
          }}
          value={formik.values.protocol}
        />
        <Input
          id="source"
          label="Source"
          placeholder="Enter source"
          type="text"
          help="Sources can be specified as CIDR or IP ranges, source subject name selectors (for ingress rules), or be left empty for any."
          {...formik.getFieldProps("source")}
        />
        {["tcp", "udp"].includes(formik.values.protocol ?? "") && (
          <Input
            id="source_port"
            label="Source port"
            placeholder="Enter source port"
            type="text"
            help="Specify a comma-separated list of ports or port ranges (start-end inclusive), or leave the value empty for any."
            {...formik.getFieldProps("source_port")}
          />
        )}
        <Input
          id="destination"
          label="Destination"
          placeholder="Enter destination"
          type="text"
          help="Destinations can be specified as CIDR or IP ranges, destination subject name selectors (for egress rules), or be left empty for any."
          {...formik.getFieldProps("destination")}
        />
        {["tcp", "udp"].includes(formik.values.protocol ?? "") && (
          <Input
            id="destination_port"
            label="Destination port"
            placeholder="Enter destination port"
            type="text"
            help="Specify a comma-separated list of ports or port ranges (start-end inclusive), or leave the value empty for any."
            {...formik.getFieldProps("destination_port")}
          />
        )}
        {["icmp4", "icmp6"].includes(formik.values.protocol ?? "") && (
          <>
            <Input
              id="icmp_code"
              label="ICMP code"
              placeholder="Enter ICMP code"
              type="text"
              help="Specify the ICMP code number, or leave the value empty for any."
              {...formik.getFieldProps("icmp_code")}
            />
            <Input
              id="icmp_type"
              label="ICMP type"
              placeholder="Enter ICMP type"
              type="text"
              help="Specify the ICMP type number, or leave the value empty for any."
              {...formik.getFieldProps("icmp_type")}
            />
          </>
        )}
      </Form>
    </Modal>
  );
};

export default NetworkAclRuleModal;
