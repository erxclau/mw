import { type ReactNode, useState } from "react";

export default function Input({
  label,
  hint,
  accept,
  onUpload,
}: {
  label: ReactNode;
  hint: ReactNode;
  accept: string;
  onUpload: (buffer: Uint8Array<ArrayBuffer>) => void;
}) {
  const [uploaded, setUploaded] = useState<boolean>(false);
  return (
    <label className="text-center flex flex-col items-center justify-center relative py-6 px-10 border-dashed border-black border rounded-lg bg-gray-200 cursor-pointer hover:bg-gray-300 focus:bg-gray-300 has-[:disabled]:text-gray-500 has-[:disabled]:cursor-not-allowed transition-colors">
      <p className="text-balance">{label}</p>
      <small className="text-gray-500">{hint}</small>
      <input
        disabled={uploaded}
        className="peer py-6 absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed file:cursor-pointer file:disabled:cursor-not-allowed"
        accept={accept}
        type="file"
        onChange={(e) => {
          if (e.target.files === null || e.target.files.length === 0) {
            return;
          }

          const file = e.target.files.item(0);
          if (file === null) {
            return;
          }

          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result === null) {
              return;
            }

            const buffer = new Uint8Array(reader.result as ArrayBuffer);
            onUpload(buffer);
            setUploaded(true);
          };

          reader.readAsArrayBuffer(file);
        }}
      />
    </label>
  );
}
