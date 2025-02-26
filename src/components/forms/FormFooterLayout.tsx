import type { FC, PropsWithChildren } from "react";

const FormFooterLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="p-bottom-controls" id="form-footer">
      <footer className="u-align--right bottom-btns">{children}</footer>
    </div>
  );
};

export default FormFooterLayout;
