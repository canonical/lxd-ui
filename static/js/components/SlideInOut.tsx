import React, { FC, ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  isActive: boolean;
  children: ReactNode;
  className: string;
}

const SlideInOut: FC<Props> = ({
  isActive = true,
  children,
  className,
}: Props) => {
  return (
    <>
      {isActive && (
        <motion.div
          className={className}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween" }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
};

export default SlideInOut;
