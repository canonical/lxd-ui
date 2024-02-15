import { FC } from "react";

interface Props {
  item: {
    name: string;
  };
  bold?: boolean;
}

const ItemName: FC<Props> = ({ item, bold = false }) => {
  const name = <span className="item-name">{item.name}</span>;
  return bold ? <b>{name}</b> : name;
};

export default ItemName;
