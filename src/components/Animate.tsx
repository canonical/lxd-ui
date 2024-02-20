import {
  FC,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePrefersReducedMotion } from "util/usePreferReducedMotion";

interface Props {
  show: boolean;
  from: Keyframe;
  to: Keyframe;
  exitAnimation?: Keyframe[];
  options?: KeyframeAnimationOptions;
  className?: string;
}

const Animate: FC<PropsWithChildren<Props>> = ({
  show,
  children,
  from,
  to,
  exitAnimation,
  options = { duration: 500, fill: "forwards" },
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const preferReducedMotion = usePrefersReducedMotion();

  // This state is used so that we trigger a extra render cycle
  // to animate the child component when it is being unmounted
  const [removeState, setRemove] = useState(!show);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (show) {
      setRemove(false);
      if (!element || preferReducedMotion) return;
      element.animate([from, to], options);
    } else {
      if (!element) return;
      if (preferReducedMotion) {
        setRemove(true);
        return;
      }
      const animation = element.animate(exitAnimation || [to, from], options);
      animation.onfinish = () => {
        setRemove(true);
        // This is important, else the next render cycle due to setRemove will cause flickering effect
        element.style.display = "none";
      };
    }
  }, [show, removeState]);

  if (removeState) {
    return null;
  }

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

export default Animate;
