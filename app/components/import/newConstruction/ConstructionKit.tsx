import FileDrop from "./FileDrop";
import { useState } from "react";
import MakePair from "./MakePair";

export default function ConstructionKit({ id }: { id: string }) {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [pairingDone, setPairingDone] = useState(false);
  return (
    <div>
      {!fileUploaded && (
        <FileDrop
          id={id}
          onFileUploaded={() => {
            setFileUploaded(true);
          }}
        />
      )}

      {fileUploaded && !pairingDone && (
        <MakePair
          id={id}
          handlePairDone={() => {
            setPairingDone(true);
          }}
        />
      )}
      {fileUploaded && pairingDone && (
        <div className="flex items-center justify-center p-8 rounded-lg bg-none border border-green-500">
          <div className="text-xl font-semibold text-green-300 flex items-center">
            <svg
              className="w-6 h-6 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            All done!
          </div>
        </div>
      )}
    </div>
  );
}
