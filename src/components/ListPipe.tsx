import { Fragment, type FC, type ReactNode } from "react";

interface Props {
  items: ReactNode[];
}

const ListPipe: FC<Props> = ({ items }) => {
  const result: ReactNode[] = [];

  for (const item of items) {
    if (item !== null && item !== undefined && item !== "" && item !== false) {
      result.push(
        <Fragment key={result.length}>
          {result.length > 0 && " | "}
          {item}
        </Fragment>,
      );
    }
  }

  return <>{result}</>;
};

export default ListPipe;
