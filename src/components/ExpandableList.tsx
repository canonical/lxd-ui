import React, { FC, ReactNode, useState } from "react";
import { Button } from "@canonical/react-components";

const DISPLAY_COUNT = 5;

interface Props {
  items: ReactNode[];
  progressive?: boolean;
}

const ExpandableList: FC<Props> = ({ items, progressive = false }) => {
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
            setDisplayCount(
              progressive ? displayCount + DISPLAY_COUNT : items.length
            );
            e.stopPropagation();
          }}
        >
          Show {progressive ? "more" : "all"}
        </Button>
      )}
    </>
  );
};

export default ExpandableList;
