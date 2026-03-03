import type { FC, PropsWithChildren } from "react";
import classnames from "classnames";

interface Props {
  isAlignRight?: boolean;
}

const FormFooterLayout: FC<PropsWithChildren<Props>> = ({
  children,
  isAlignRight = true,
}) => {
  return (
    <div className="p-bottom-controls form-footer" id="form-footer">
      <footer
        className={classnames("bottom-btns", {
          "u-align--right": isAlignRight,
        })}
      >
        {children}
      </footer>
    </div>
  );
};

export default FormFooterLayout;
