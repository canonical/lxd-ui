import { DOC_BASE_PATH } from "context/DOC_BASE_PATH";
import type { FC, ReactNode } from "react";
import DsIcon from "components/DsIcon";

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
  return (
    <a
      className={className}
      href={`${DOC_BASE_PATH}${docPath}`}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >
      {children}
      {hasExternalIcon && (
        <DsIcon className="external-link-icon" icon="external-link" />
      )}
    </a>
  );
};

export default DocLink;
