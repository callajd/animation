import { Effect, Fiber, Result } from "effect";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { usePupilGaze } from "./usePupilGaze";
import "./SprinterVan.css";

export type SprinterVanExpression =
  | "idle"
  | "happy"
  | "thinking"
  | "working"
  | "excited"
  | "success"
  | "concerned"
  | "sleepy";

export interface SprinterVanProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** Semantic expression to display. */
  expression?: SprinterVanExpression;

  /**
   * URL of animation_ready_van.svg.
   * Put the SVG in your public/static directory and point this at it.
   */
  src?: string;

  /**
   * Optional already-loaded SVG source. Useful when your bundler supports
   * importing SVG files as text. If provided, no fetch is performed.
   */
  svg?: string;

  /** Disable all ambient animation while retaining the selected expression. */
  animate?: boolean;

  /** Accessible label. Set to null to make the illustration decorative. */
  label?: string | null;

  /** Pupil color against the black headlamp sockets. Defaults to white. */
  pupilColor?: string;

  /** @deprecated Use pupilColor. This now colors the pupils, not a lamp glow. */
  headlightColor?: string;

  /** Smoke color. Defaults to the original black. */
  smokeColor?: string;
}


function prepareSvg(svgText: string, label: string | null): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.documentElement;

  if (
    svg.nodeName.toLowerCase() !== "svg" ||
    svg.namespaceURI !== "http://www.w3.org/2000/svg"
  ) {
    throw new Error("SprinterVan: source is not an SVG document.");
  }

  // Let the React wrapper control sizing.
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  if (label === null) {
    svg.setAttribute("aria-hidden", "true");
    svg.removeAttribute("aria-labelledby");
    svg.removeAttribute("role");
  } else {
    svg.removeAttribute("aria-hidden");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    svg.removeAttribute("aria-labelledby");
  }

  // animation_ready_van.svg contains a flattened static exhaust plume in
  // #van-base. Cover only that outside-the-body region, then animate the
  // independent puff paths already present in #exhaust-puffs.
  const exhaustPuffs = svg.querySelector("#exhaust-puffs");
  if (exhaustPuffs && !svg.querySelector("[data-exhaust-eraser]")) {
    const eraser = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
    eraser.setAttribute("x", "1118");
    eraser.setAttribute("y", "462");
    eraser.setAttribute("width", "180");
    eraser.setAttribute("height", "126");
    eraser.setAttribute("data-exhaust-eraser", "");
    exhaustPuffs.parentNode?.insertBefore(eraser, exhaustPuffs);
  }

  return new XMLSerializer().serializeToString(svg);
}

interface VanStyle extends CSSProperties {
  "--van-pupil-color": string;
  "--van-smoke-color": string;
}

interface LoadedSvg {
  src: string;
  result: Result.Result<string, Error>;
}

export function SprinterVan({
  expression = "idle",
  src = "/animation_ready_van.svg",
  svg: svgProp,
  animate = true,
  label = "Sprinter van illustration",
  headlightColor,
  pupilColor = headlightColor ?? "#ffffff",
  smokeColor = "#000",
  className,
  style,
  ...divProps
}: SprinterVanProps) {
  const [loadedSvg, setLoadedSvg] = useState<LoadedSvg | null>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (svgProp !== undefined) return;

    const fiber = Effect.runFork(
      Effect.tryPromise({
        try: async (signal) => {
          const response = await fetch(src, { signal });
          if (!response.ok) {
            throw new Error(
              `SprinterVan: failed to load ${src} (${response.status} ${response.statusText}).`,
            );
          }
          return response.text();
        },
        catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)),
      }).pipe(
        Effect.match({
          onSuccess: (text) => setLoadedSvg({ src, result: Result.succeed(text) }),
          onFailure: (error) => setLoadedSvg({ src, result: Result.fail(error) }),
        }),
      ),
    );

    return () => { Effect.runFork(Fiber.interrupt(fiber)); };
  }, [src, svgProp]);

  const prepared = useMemo(() => {
    const source = svgProp !== undefined
      ? Result.succeed(svgProp)
      : loadedSvg?.src === src
        ? loadedSvg.result
        : Result.succeed(null);

    return Result.flatMap(source, (text) => {
      if (text === null || typeof DOMParser === "undefined") return Result.succeed(null);
      return Effect.runSync(
        Effect.try({
          try: () => prepareSvg(text, label),
          catch: (cause) => cause instanceof Error ? cause : new Error(String(cause)),
        }).pipe(Effect.result),
      );
    });
  }, [loadedSvg, src, svgProp, label]);

  const preparedSvg = Result.getOrElse(prepared, () => null);
  usePupilGaze(hostRef, preparedSvg !== null && animate && expression !== "sleepy");

  // Keep the resting exhaust silhouettes in sync with the expression.
  // Pupil motion and expression styling live in SprinterVan.css.
  useEffect(() => {
    const rootSvg = hostRef.current?.querySelector("svg");
    rootSvg?.setAttribute("data-state", expression);
  }, [expression, preparedSvg]);

  const mergedStyle: VanStyle = {
    ...style,
    "--van-pupil-color": pupilColor,
    "--van-smoke-color": smokeColor,
  };

  if (Result.isFailure(prepared)) {
    return (
      <div
        {...divProps}
        className={className}
        style={mergedStyle}
        data-sprinter-van=""
        role="img"
        aria-label={label ?? undefined}
      >
        <span style={{ lineHeight: 1.4 }}>
          Unable to load van illustration: {prepared.failure.message}
        </span>
      </div>
    );
  }

  return (
    <div
      {...divProps}
      className={className}
      style={mergedStyle}
      data-sprinter-van=""
      data-expression={expression}
      data-animate={animate ? "true" : "false"}
    >
      <div
        ref={hostRef}
        data-svg-host=""
        // Safe here because this component is intended for the project-owned
        // animation_ready_van.svg, not arbitrary user-provided markup.
        dangerouslySetInnerHTML={
          preparedSvg === null ? undefined : { __html: preparedSvg }
        }
      />
    </div>
  );
}

export default SprinterVan;
