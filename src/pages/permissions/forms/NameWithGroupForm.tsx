import type { FC } from "react";
import { Form, Input } from "@canonical/react-components";
import type { FormikProps } from "formik/dist/types";
import type { IdpGroupFormValues } from "types/forms/idpGroup";
import type { TLSIdentityFormValues } from "types/forms/tlsIdentity";

interface Props {
  formik: FormikProps<IdpGroupFormValues | TLSIdentityFormValues>;
}

const NameWithGroupForm: FC<Props> = ({ formik }) => {
  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        type="text"
        label="Name"
        required
        autoFocus
        id="name"
        name="name"
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        value={formik.values.name}
        error={formik.touched.name ? formik.errors.name : null}
        placeholder="Enter name"
      />
    </Form>
  );
};

export default NameWithGroupForm;
