import { QueryClient } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import React from "react";
import type { ReactNode } from "react";

import ComponentProviders from "./ComponentProviders";

type Options = {
  url?: string;
  path?: string;
  routeChildren?: ReactNode;
  queryClient?: QueryClient;
};

export const changeURL = (url: string) => window.happyDOM.setURL(url);

export const renderComponent = (
  component: React.JSX.Element,
  options?: Options | null,
) => {
  const queryClient = options?.queryClient
    ? options.queryClient
    : new QueryClient();
  changeURL(options?.url ?? "/");
  const result = render(component, {
    wrapper: (props) => (
      <ComponentProviders
        {...props}
        routeChildren={options?.routeChildren}
        path={options?.path ?? "*"}
        queryClient={queryClient}
      />
    ),
  });
  return { changeURL, result, queryClient };
};
