import type { FC, ReactNode } from "react";
import { useState } from "react";
import { Button } from "@canonical/react-components";

const DISPLAY_COUNT = 5;

interface Props {
  items: ReactNode[];
  displayCount?: number;
}

const ExpandableList: FC<Props> = ({ items, displayCount = DISPLAY_COUNT }) => {
  const [currentDisplayCount, setCurrentDisplayCount] = useState(displayCount);

  return (
    <>
      {items.slice(0, currentDisplayCount)}
      {currentDisplayCount < items.length && (
        <Button
          appearance="link"
          className="u-no-margin--bottom"
          small
          onClick={(e) => {
            setCurrentDisplayCount(items.length);
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
