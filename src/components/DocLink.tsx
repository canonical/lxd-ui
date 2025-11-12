import { useDocs } from "context/useDocs";
import type { FC, ReactNode } from "react";

interface Props {
  docPath: string;
  content: ReactNode;
  className?: string;
  title?: string;
}

const DocLink: FC<Props> = ({ docPath, content, className, title }) => {
  const docBaseLink = useDocs();

  return (
    <a
      className={className}
      href={`${docBaseLink}${docPath}`}
      target="_blank"
      rel="noopener noreferrer"
      title={title}
    >
      {content}
    </a>
  );
};

export default DocLink;
