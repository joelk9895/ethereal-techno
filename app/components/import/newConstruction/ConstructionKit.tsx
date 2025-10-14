import FileDrop from "./FileDrop";
import { useState, useEffect } from "react";
import MakePair from "./MakePair";
import { InfoIcon, ArrowDown } from "lucide-react";

export default function ConstructionKit({ id }: { id: string }) {
  const [fileUploaded, setFileUploaded] = useState(false);
  const [pairingDone, setPairingDone] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
        <div className="flex justify-center items-center h-96">
          <div
            role="alert"
            aria-live="polite"
            className={`bg-gradient-to-r from-black via-gray-900 to-black 
                      border-l-4 border-primary rounded-lg shadow-xl 
                      max-w-lg w-full overflow-hidden ${
                        pulseEffect ? "shadow-primary/20" : ""
                      } transition-all duration-700`}
          >
            <div className="relative">
              <div
                className={`absolute inset-0 bg-primary/5 ${
                  pulseEffect ? "opacity-30" : "opacity-10"
                } transition-opacity duration-700`}
              ></div>

              <div className="flex p-5 relative z-10">
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-12 h-12 
                              rounded-full bg-primary/10 text-primary mr-4 ${
                                pulseEffect ? "animate-pulse" : ""
                              }`}
                >
                  <InfoIcon size={24} />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white mb-1">
                      Almost Done!
                    </h3>
                  </div>

                  <p className="text-white/70 mb-3">
                    Your kit is ready. Complete the metadata to make it easier
                    to find and use.
                  </p>

                  <button
                    className={`group flex items-center gap-1.5 px-4 py-2 
                             bg-gradient-to-r from-primary/80 to-primary
                             text-black font-medium rounded-md
                             hover:from-primary hover:to-primary/90
                             transition-all duration-300
                             ${
                               pulseEffect ? "shadow-lg shadow-primary/20" : ""
                             }`}
                  >
                    Complete Kit Setup Below
                    <ArrowDown className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>

              <div className="h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-slide"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
