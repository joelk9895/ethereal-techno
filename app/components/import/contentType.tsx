import { contentTypes } from "@/app/data/sample";
import { Button } from "../ui/button";

export default function ContentType({
  selectedContentType,
  setSelectedContentType,
}: {
  selectedContentType: string;
  setSelectedContentType: (type: string) => void;
}) {
  return (
    <div className="space-y-6 p-0">
      <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
        Content Type
      </h3>
      <div className="flex flex-wrap gap-3">
        {contentTypes.map((type) => (
          <Button
            key={type}
            onClick={() => {
              setSelectedContentType(type);
            }}
            className={`px-6 py-3 text-sm font-medium tracking-wide transition-all duration-200 border border-gray-700 ${
              selectedContentType === type
                ? "bg-primary text-black"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            {type}
          </Button>
        ))}
      </div>
    </div>
  );
}
