import { FC, PropsWithChildren } from "react";

interface Props {}

const FormFooterLayout: FC<Props & PropsWithChildren> = ({ children }) => {
  return (
    <div className="p-bottom-controls" id="form-footer">
      <footer className="u-align--right bottom-btns">{children}</footer>
    </div>
  );
};

export default FormFooterLayout;
