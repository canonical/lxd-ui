import { Fragment, type FC, type ReactNode } from "react";

interface Props {
  items: ReactNode[];
  numberToShow?: number;
}

const TruncatedList: FC<Props> = ({ items, numberToShow = 2 }) => {
  if (items.length <= numberToShow) {
    return items.map((item, index) => <Fragment key={index}>{item}</Fragment>);
  }

  return (
    <>
      {items.slice(0, numberToShow).map((item, index) => (
        <Fragment key={index}>{item}</Fragment>
      ))}
      <div className="p-text--x-small u-text--muted u-no-margin">
        + {items.length - numberToShow} more
      </div>
    </>
  );
};

export default TruncatedList;
