import {
  Fragment,
  isValidElement,
  Children,
  type ComponentProps,
  type FC,
  type MouseEvent,
  type ReactNode,
} from "react";
import ResourceLink from "./ResourceLink";

interface Props {
  callback: (event?: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

const ClickInterceptor: FC<Props> = ({ callback, children }) => {
  if (!isValidElement(children)) {
    return <>{children}</>;
  }
  if (children.type === Fragment) {
    const childrenWithHandler = Children.map(
      (children.props as { children: ReactNode[] }).children,
      (child): ReactNode => {
        if (isValidElement(child) && child.type === ResourceLink) {
          const childProps = child.props as ComponentProps<typeof ResourceLink>;
          return (
            <ResourceLink key={child.key} {...childProps} onClick={callback} />
          );
        }
        return child;
      },
    );
    return <>{childrenWithHandler}</>;
  }
  if (children.type === ResourceLink) {
    const linkProps = children.props as React.ComponentProps<
      typeof ResourceLink
    >;
    return <ResourceLink {...linkProps} onClick={callback} />;
  }
  return <>{children}</>;
};

export default ClickInterceptor;
