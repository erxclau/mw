import { createContext } from "react";

export const StageContext = createContext<{
  stage: number | undefined;
  shown: number | undefined;
}>({ stage: undefined, shown: undefined });
