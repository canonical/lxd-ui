import { Icon } from "@canonical/react-components";
import type { PropsWithSpread } from "@canonical/react-components/dist/types";
import type { ComponentType, ElementType, ReactNode, HTMLProps } from "react";

export type LinkDefaultElement = HTMLProps<HTMLAnchorElement>;

export type Props<L = LinkDefaultElement> = PropsWithSpread<
  {
    dark?: boolean;
    icon?: string;
    label: ReactNode;
    component?: ElementType | ComponentType<L>;
  },
  L
>;

const SideNavigationLink = <L = LinkDefaultElement,>({
  dark,
  icon,
  label,
  component: LinkComponent = "a",
  ...props
}: Props<L>) => {
  return (
    <LinkComponent className="p-side-navigation__link" {...props}>
      {icon ? (
        <Icon name={icon} light={!dark} className="p-side-navigation__icon" />
      ) : null}
      <span className="p-side-navigation__label">
        <span className="p-side-navigation__label">{label}</span>
      </span>
    </LinkComponent>
  );
};

export default SideNavigationLink;
