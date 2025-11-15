import type { FC } from "react";
import { useState } from "react";
import { Button, Form, Textarea, useNotify } from "@canonical/react-components";
import { addCertificate } from "api/certificates";

const CertificateAddForm: FC = () => {
  const notify = useNotify();
  const [token, setToken] = useState("");

  const submitCertificateToken = () => {
    const sanitisedToken =
      token
        .trim()
        .split(/\r?\n|\r|\n/g)
        .at(-1) ?? "";

    addCertificate(sanitisedToken)
      .then(() => {
        location.reload();
      })
      .catch((e) => notify.failure("Error using token", e));
  };

  return (
    <Form>
      <Textarea
        id="token"
        name="token"
        label="Paste the identity trust token below:"
        placeholder="Enter identity trust token"
        rows={5}
        onChange={(e) => {
          setToken(e.target.value);
        }}
      />
      <Button
        appearance="positive"
        disabled={token.length < 1}
        type="button"
        onClick={submitCertificateToken}
      >
        Connect
      </Button>
    </Form>
  );
};

export default CertificateAddForm;
