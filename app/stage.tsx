import { use, useState, type ReactNode } from "react";
import { StageContext } from "./page";

export default function Stage({
  children,
  stage,
  onComplete,
}: {
  children: ReactNode;
  stage: number | undefined;
  onComplete: () => void;
}) {
  const stageContext = use(StageContext);
  const [removed, setRemoved] = useState(false);

  if (removed) {
    return null;
  }

  if (stage !== stageContext.stage) {
    return null;
  }

  return (
    <div
      className="stage grid grid-rows-[1fr_auto] gap-4"
      style={{
        transform:
          stage === stageContext.shown ? undefined : "translateY(-250px)",
        opacity: stage === stageContext.shown ? undefined : 0,
        minHeight: stage === undefined ? undefined : 300,
      }}
      onTransitionEnd={(e) => {
        if (e.propertyName === "transform" && stage !== stageContext.shown) {
          onComplete();
          setRemoved(true);
        }
      }}
    >
      {children}
    </div>
  );
}
