import { FC, ReactNode } from "react";
import { Form, Input } from "@canonical/react-components";
import { FormikProps } from "formik/dist/types";
import AutoExpandingTextArea from "components/AutoExpandingTextArea";

export interface GroupFormValues {
  name: string;
  description: string;
}

interface Props {
  formik: FormikProps<GroupFormValues>;
}

const GroupForm: FC<Props> = ({ formik }) => {
  const getFormProps = (id: "name" | "description") => {
    return {
      id: id,
      name: id,
      onBlur: formik.handleBlur,
      onChange: formik.handleChange,
      value: formik.values[id] ?? "",
      error: formik.touched[id] ? (formik.errors[id] as ReactNode) : null,
      placeholder: `Enter ${id.replaceAll("_", " ")}`,
    };
  };

  return (
    <Form onSubmit={formik.handleSubmit}>
      {/* hidden submit to enable enter key in inputs */}
      <Input type="submit" hidden value="Hidden input" />
      <Input
        {...getFormProps("name")}
        type="text"
        label="Name"
        required
        autoFocus
      />
      <AutoExpandingTextArea
        {...getFormProps("description")}
        label="Description"
        dynamicHeight
      />
    </Form>
  );
};

export default GroupForm;
