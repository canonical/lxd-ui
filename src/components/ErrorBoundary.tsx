import { FC } from "react";
import type { PropsWithChildren } from "react";
import { Component } from "react";

type Props = PropsWithChildren & {
  fallback: FC<{ error?: Error }>;
};

type State = {
  error?: Error;
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  render() {
    const { error, hasError } = this.state;
    const { children, fallback: ErrorComponent } = this.props;

    return hasError ? <ErrorComponent error={error} /> : <>{children}</>;
  }
}
