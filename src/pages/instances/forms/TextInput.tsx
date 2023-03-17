import React, { FC } from "react";
import { Input } from "@canonical/react-components";
import { Props } from "@canonical/react-components/dist/components/Input/Input";

export const TextInput: FC<Props> = (props) => <Input type="text" {...props} />;
