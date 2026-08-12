import type { LxdProfile } from "types/profile";
import type { LxdInstance } from "types/instance";
import type { SshKey } from "types/forms/instanceAndProfile";
import * as Yup from "yup";
import type { InstanceAndProfileFormikProps } from "types/forms/instanceAndProfileFormProps";
import type { MemoryLimit } from "types/limits";

export const parseSshKeys = (item: LxdProfile | LxdInstance): SshKey[] => {
  const sshConfigKeys = Object.keys(item.config).filter((item) =>
    item.startsWith("cloud-init.ssh-keys."),
  );

  return sshConfigKeys.map((key) => {
    const [user, fingerprint] = (item.config[key] as string).split(/:(.*)/s); // split on first occurrence of ":"
    const name = key.split(".")[2];
    return {
      id: name,
      name: name,
      user: user,
      fingerprint: fingerprint,
    };
  });
};

export const InstanceEditSchema: Yup.ObjectSchema<{
  name: string;
  instanceType: string;
}> = Yup.object().shape({
  name: Yup.string().required("Instance name is required"),
  instanceType: Yup.string().required("Instance type is required"),
  limits_memory: Yup.mixed<MemoryLimit>().test(
    "non-zero",
    "Limit must be greater than 0",
    (memory) => memory?.value !== 0,
  ),
});

export const isInstanceCreation = (
  formik: InstanceAndProfileFormikProps,
): boolean => {
  return (
    formik.values.entityType === "instance" &&
    "isCreating" in formik.values &&
    formik.values.isCreating
  );
};
