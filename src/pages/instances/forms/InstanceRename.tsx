import React, { FC, useState } from "react";
import { LxdInstance } from "types/instance";
import { Button, Input } from "@canonical/react-components";
import { renameInstance } from "api/instances";
import { useNotify } from "context/notify";
import { useNavigate } from "react-router-dom";
import SubmitButton from "components/SubmitButton";

interface Props {
  instance: LxdInstance;
  project: string;
  closeForm: () => void;
}

const InstanceRename: FC<Props> = ({ instance, project, closeForm }) => {
  const navigate = useNavigate();
  const notify = useNotify();
  const [name, setName] = useState(instance.name);
  const [isSubmitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (instance.name === name) {
      closeForm();
      return;
    }
    setSubmitting(true);
    renameInstance(instance.name, name, project)
      .then(() => {
        navigate(
          `/ui/${project}/instances/detail/${name}`,
          notify.queue(notify.success("Instance renamed."))
        );
        closeForm();
      })
      .catch((e) => notify.failure("Renaming failed", e))
      .finally(() => setSubmitting(false));
  };

  return (
    <>
      <Input
        autoFocus
        className="u-no-margin--bottom name-input"
        onChange={(e) => setName(e.target.value)}
        onKeyUp={(e) => e.key === "Enter" && handleSubmit()}
        type="text"
        value={name}
      />
      <Button appearance="base" className="cancel" dense onClick={closeForm}>
        Cancel
      </Button>
      <SubmitButton
        isSubmitting={isSubmitting}
        isDisabled={false}
        buttonLabel="Save"
        onClick={handleSubmit}
        dense
      />
    </>
  );
};

export default InstanceRename;
