import { Icon } from "@canonical/react-components";
import { useDocs } from "context/useDocs";
import type { FC, ReactNode } from "react";

interface Props {
  docPath: string;
  children: ReactNode;
  hasExternalIcon?: boolean;
  className?: string;
  title?: string;
}

const DocLink: FC<Props> = ({
  docPath,
  children,
  hasExternalIcon = false,
  className,
  title,
}) => {
  const docBaseLink = useDocs();

  return (
    <a
      className={className}
      href={`${docBaseLink}${docPath}`}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >
      {children}
      {hasExternalIcon && (
        <Icon className="external-link-icon" name="external-link" />
      )}
    </a>
  );
};

export default DocLink;
