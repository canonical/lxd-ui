import { FC, PropsWithChildren } from "react";

const Left: FC<PropsWithChildren> = ({ children }) => {
  return <div className="page-header__left">{children}</div>;
};

const Title: FC<PropsWithChildren> = ({ children }) => {
  return <h1 className="p-heading--4 u-no-margin--bottom">{children}</h1>;
};

const Search: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="page-header__search margin-right u-no-margin--bottom">
      {children}
    </div>
  );
};

const BaseActions: FC<PropsWithChildren> = ({ children }) => {
  return <div className="page-header__base-actions">{children}</div>;
};

const Header: FC<PropsWithChildren> = ({ children }) => {
  return <div className="p-panel__header page-header">{children}</div>;
};

type PageHeaderComponents = FC<PropsWithChildren> & {
  Left: FC<PropsWithChildren>;
  Title: FC<PropsWithChildren>;
  Search: FC<PropsWithChildren>;
  BaseActions: FC<PropsWithChildren>;
};

const PageHeader = Header as PageHeaderComponents;
PageHeader.Left = Left;
PageHeader.Title = Title;
PageHeader.Search = Search;
PageHeader.BaseActions = BaseActions;

export default PageHeader;
