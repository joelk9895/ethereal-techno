export interface BPMResult {
  bars: number;
  bpm: number;
}

export async function calculateBPMFromFile(
  file: File
): Promise<BPMResult | null> {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    audio.addEventListener("loadedmetadata", () => {
      const duration = audio.duration;
      const barsList = [2, 4, 8, 16, 32];
      const bpmRange = { min: 115, max: 130 };
      const beatsPerBar = 4;

      for (const bars of barsList) {
        const bpm = Math.round((60 * beatsPerBar * bars) / duration);

        if (bpm >= bpmRange.min && bpm <= bpmRange.max) {
          URL.revokeObjectURL(url);
          resolve({ bars, bpm });
          return;
        }
      }

      URL.revokeObjectURL(url);
      resolve(null);
    });

    audio.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      resolve(null);
    });

    audio.src = url;
  });
}

export function formatBPMResult(result: BPMResult | null): string {
  if (!result) return "";
  return result.bpm.toString();
}
