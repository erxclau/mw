import { useEffect, useRef } from "react";
import { select } from "d3-selection";
import { interpolate } from "d3-interpolate";
import "d3-transition";

import { numberFormatter } from "@/app/format";

export default function Counter({ number }: { number: number | undefined }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current === null || number === undefined || number === null) {
      return;
    }

    const selection = select(ref.current);
    selection
      .property("_current", 0)
      .datum(number)
      .transition()
      .duration(2500)
      .textTween((d) => {
        const current = Number(selection.property("_current"));
        const i = interpolate(current, d);
        return function (t) {
          const c = i(t);
          selection.property("_current", c);
          return numberFormatter.format(c);
        };
      });
  }, [number]);

  if (number === undefined || number === null) {
    return null;
  }

  const formattedNumber = numberFormatter.format(number);
  const numCommas =
    formattedNumber.length - formattedNumber.replaceAll(",", "").length;
  const digits = formattedNumber.length - numCommas + numCommas * 0.5;

  return (
    <span
      className="tabular-nums inline-block font-bold text-right"
      style={{ width: `${digits}ch` }}
      ref={ref}
    />
  );
}
