import { useState, type ReactNode } from "react";

export default function Button({
  onClick,
  delay,
  children,
}: {
  onClick: () => void;
  delay: number;
  children?: ReactNode;
}) {
  const [hidden, setHidden] = useState<boolean>(true);

  return (
    <button
      disabled={hidden}
      className="fade font-bold w-fit px-5 py-2 uppercase text-white bg-gradient-to-tr from-cyan-400 via-purple-400 to-red-400 rounded-xl shadow-sm shadow-gray-500"
      onClick={onClick}
      style={{ transitionDelay: `${delay}ms` }}
      onTransitionEnd={() => {
        setHidden(false);
      }}
    >
      {children ?? "Next"}
    </button>
  );
}
