import { FC, ReactNode, useState } from "react";
import { Button } from "@canonical/react-components";

const DISPLAY_COUNT = 5;

interface Props {
  items: ReactNode[];
}

const ExpandableList: FC<Props> = ({ items }) => {
  const [displayCount, setDisplayCount] = useState(DISPLAY_COUNT);

  return (
    <>
      {items.slice(0, displayCount)}
      {displayCount < items.length && (
        <Button
          appearance="link"
          className="u-no-margin--bottom"
          small
          onClick={(e) => {
            setDisplayCount(items.length);
            e.stopPropagation();
          }}
        >
          Show all
        </Button>
      )}
    </>
  );
};

export default ExpandableList;
