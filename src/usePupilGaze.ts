import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, type RefObject } from "react";

/** Motion supplies the damped springs; SVG clipping keeps the gaze inside each lamp. */
export function usePupilGaze(hostRef: RefObject<HTMLDivElement | null>, enabled: boolean) {
  const reducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 22, mass: .8 });
  const springY = useSpring(y, { stiffness: 160, damping: 22, mass: .8 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    if (!enabled || reducedMotion) {
      x.jump(0);
      y.jump(0);
      springX.jump(0);
      springY.jump(0);
      host.style.setProperty("--van-gaze-x", "0px");
      host.style.setProperty("--van-gaze-y", "0px");
      return;
    }

    const unsubscribeX = springX.on("change", (value) => {
      host.style.setProperty("--van-gaze-x", `${value}px`);
    });
    const unsubscribeY = springY.on("change", (value) => {
      host.style.setProperty("--van-gaze-y", `${value}px`);
    });

    function reset() {
      x.set(0);
      y.set(0);
    }

    function lookAtPointer(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      const svg = host?.querySelector("svg");
      const eyes = host?.querySelector("#headlights");
      if (!svg || !eyes) return;
      const canvas = svg.getBoundingClientRect();
      const face = eyes.getBoundingClientRect();
      if (canvas.width === 0 || canvas.height === 0) return;

      const horizontal = (event.clientX - face.x - face.width / 2) / (canvas.width / 2);
      const vertical = (event.clientY - face.y - face.height / 2) / (canvas.height / 2);
      x.set(Math.max(-1, Math.min(1, horizontal)) * 7);
      y.set(Math.max(-1, Math.min(1, vertical)) * 5);
    }

    window.addEventListener("pointermove", lookAtPointer, { passive: true });
    window.addEventListener("blur", reset);
    document.documentElement.addEventListener("pointerleave", reset);

    return () => {
      unsubscribeX();
      unsubscribeY();
      window.removeEventListener("pointermove", lookAtPointer);
      window.removeEventListener("blur", reset);
      document.documentElement.removeEventListener("pointerleave", reset);
    };
  }, [enabled, reducedMotion, hostRef, x, y, springX, springY]);
}
