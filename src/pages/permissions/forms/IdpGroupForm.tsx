import { FC } from "react";
import { Form, Input } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";

export interface IdpGroupFormValues {
  name: string;
}

interface Props {
  formik: FormikProps<IdpGroupFormValues>;
}

const IdpGroupForm: FC<Props> = ({ formik }) => {
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

export default IdpGroupForm;
