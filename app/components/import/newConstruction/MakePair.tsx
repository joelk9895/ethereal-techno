import Loading from "@/app/components/general/loading";
import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  CheckCircle,
  FileAudio,
  Music,
  Settings,
  Link,
  X,
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";

type ContentItem = {
  id: string;
  contentType: string;
  contentName: string;
  soundGroup: string;
  subGroup: string;
  bpm: string;
  key: string;
  fileId: string;
  file: {
    fileName: string;
    fileUrl: string;
  };
};

type PairType = {
  name: string;
  description: string;
  requiredTypes: string[];
};

type Pair = {
  id: string;
  name: string;
  type: string;
  items: string[];
};


export default function MakePair({
  id = "308f8718-884c-4d9b-88dc-2c57d430d761",
  pairTypes = [
    {
      name: "Sample Loop + MIDI",
      description: "Pair a loop with a matching MIDI file",
      requiredTypes: ["Sample Loop", "MIDI"],
    },
    {
      name: "Sample Loop + MIDI + Preset",
      description: "Pair a loop with matching MIDI and sound preset",
      requiredTypes: ["Sample Loop", "MIDI", "Preset"],
    },
  ],
  handlePairDone = () => { },
  onBack,
}: {
  id: string;
  pairTypes?: PairType[];
  handlePairDone?: () => void;
  onBack?: () => void;
}) {
  const [loading, setLoading] = useState(true);

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedPairType, setSelectedPairType] = useState<string>(
    pairTypes[0].name
  );
  const [savingPair, setSavingPair] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/pairing/${id}`,
      { method: "GET" }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.contents) {
          const processedContents = data.contents.map(
            (item: {
              file: { awsKey: string; fileName: string };
              id: string;
              contentType: string;
              contentName: string;
              soundGroup: string;
              subGroup: string;
              bpm: string;
              key: string;
              fileId: string;
            }) => ({
              ...item,
              file: {
                ...item.file,
                fileUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/content/stream?key=${item.file.awsKey}`,
              },
            })
          );
          setContentItems(processedContents);
        }
      })
      .catch((error) => {
        console.error("Error fetching construction kit data:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getFileIcon = (contentType: string) => {
    switch (contentType) {
      case "Sample Loop":
      case "One-Shot":
        return <FileAudio className="w-4 h-4 text-gray-400" />;
      case "MIDI":
        return <Music className="w-4 h-4 text-gray-400" />;
      case "Preset":
        return <Settings className="w-4 h-4 text-gray-400" />;
      default:
        return <FileAudio className="w-4 h-4 text-gray-400" />;
    }
  };

  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
      setError("");
      return;
    }

    const pairType = pairTypes.find((pt) => pt.name === selectedPairType);
    if (!pairType) return;

    const currentItem = contentItems.find((item) => item.id === itemId);
    if (!currentItem) return;

    const selectedTypes = selectedItems.map(
      (id) => contentItems.find((item) => item.id === id)?.contentType
    );

    if (!pairType.requiredTypes.includes(currentItem.contentType)) {
      setError(
        `The selected pair type (${pairType.name}) does not allow adding a ${currentItem.contentType} file. Please select a different pair type.`
      );
      return;
    }

    if (selectedTypes.includes(currentItem.contentType)) {
      setError(
        `You already selected a ${currentItem.contentType} file. Each pair can only have one of each type.`
      );
      return;
    }

    setSelectedItems([...selectedItems, itemId]);
    setError("");
  };

  const isItemSelectable = (item: ContentItem) => {
    const pairType = pairTypes.find((pt) => pt.name === selectedPairType);
    if (!pairType) return false;

    if (!pairType.requiredTypes.includes(item.contentType)) {
      return false;
    }

    const selectedTypes = selectedItems.map(
      (id) => contentItems.find((item) => item.id === id)?.contentType
    );

    if (selectedTypes.includes(item.contentType)) {
      return false;
    }

    if (isItemInAnyPair(item.id)) {
      return false;
    }

    return true;
  };

  const validatePairRequirements = () => {
    const pairType = pairTypes.find((pt) => pt.name === selectedPairType);
    if (!pairType) return false;

    const selectedTypes = selectedItems.map(
      (id) => contentItems.find((item) => item.id === id)?.contentType
    );

    const missingTypes = pairType.requiredTypes.filter(
      (type) => !selectedTypes.includes(type)
    );

    if (missingTypes.length > 0) {
      setError(`Missing required file types: ${missingTypes.join(", ")}`);
      return false;
    }

    return true;
  };

  const createPair = async () => {
    if (!validatePairRequirements()) {
      return;
    }

    setSavingPair(true);
    setError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/import/constructionKit/pairing/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pair: {
              type: selectedPairType,
              items: selectedItems,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create pair");
      }

      await response.json();

      const newPair = {
        id: `pair-${Date.now()}`,
        name: selectedPairType,
        type: selectedPairType,
        items: selectedItems,
      };

      setPairs([...pairs, newPair]);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error creating pair:", error);
      setError("Failed to create pair");
    } finally {
      setSavingPair(false);
    }
  };

  const deletePair = (pairId: string) => {
    setPairs(pairs.filter((pair) => pair.id !== pairId));
  };

  const isItemInAnyPair = (itemId: string) => {
    return pairs.some((pair) => pair.items.includes(itemId));
  };

  const getSelectedTypeCounts = () => {
    const counts: Record<string, number> = {};

    selectedItems.forEach((id) => {
      const item = contentItems.find((item) => item.id === id);
      if (item) {
        const type = item.contentType;
        counts[type] = (counts[type] || 0) + 1;
      }
    });

    return counts;
  };

  const selectedTypeCounts = getSelectedTypeCounts();

  useEffect(() => {
    const pairType = pairTypes.find((pt) => pt.name === selectedPairType);
    if (!pairType) return;

    const validSelections = selectedItems.filter((id) => {
      const item = contentItems.find((item) => item.id === id);
      return item && pairType.requiredTypes.includes(item.contentType);
    });

    if (validSelections.length !== selectedItems.length) {
      setSelectedItems(validSelections);
      setError(
        "Some selected files were removed because they're not compatible with the new pair type"
      );
    }
  }, [selectedPairType]);

  return (
    <div className="">
      <div className="bg-black w-[95vw] border border-white/20  shadow-2xl  h-[70vh] flex flex-col overflow-hidden rounded-2xl">
        {loading ? (
          <div className="p-12 flex items-center justify-center h-full">
            <Loading />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-white/20">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="flex items-center gap-2 rounded-full bg-white/10 p-2 text-white/70 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <div>
                    <h2 className="text-2xl font-main uppercase tracking-wider text-white">
                      Create Sound Pairs
                    </h2>
                    <p className="text-sm text-white/70 mt-1">
                      Group related files together to create logical sound pairs
                    </p>
                  </div>
                </div>
                <Button
                  variant="default"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg"
                  onClick={handlePairDone}
                >
                  Continue
                </Button>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              <div className="flex-1 flex flex-col min-h-0 border-r border-white/20">
                <div className="p-6 pb-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Available Files</h3>
                    <span className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded">
                      {contentItems.length} files
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
                  <div className="space-y-2">
                    {contentItems.length > 0 ? (
                      contentItems.map((item) => {
                        const isSelected = selectedItems.includes(item.id);
                        const isPaired = isItemInAnyPair(item.id);
                        const canSelect =
                          isSelected || (!isPaired && isItemSelectable(item));

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center p-3 rounded-lg border transition-all ${isSelected
                                ? "bg-blue-900/30 border-blue-500/50 cursor-pointer"
                                : isPaired
                                  ? "bg-green-900/30 border-green-500/50 opacity-70"
                                  : canSelect
                                    ? "border-white/10 hover:border-white/30 bg-white/5 cursor-pointer"
                                    : "border-white/10 bg-white/5 opacity-40 cursor-not-allowed"
                              }`}
                            onClick={() => {
                              if (isSelected || canSelect) {
                                toggleItemSelection(item.id);
                              } else if (isPaired) {
                                setError(
                                  "This file is already used in another pair"
                                );
                              } else {
                                setError(
                                  `This ${item.contentType} cannot be added to the current pair type or you already selected an item of this type`
                                );
                              }
                            }}
                          >
                            <div className="flex-1 flex items-center gap-3">
                              <div
                                className={`rounded-lg p-2 ${isSelected
                                    ? "bg-blue-900/50"
                                    : isPaired
                                      ? "bg-green-900/50"
                                      : "bg-white/10"
                                  }`}
                              >
                                {getFileIcon(item.contentType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {item.contentName}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-white/20 text-white/70 bg-white/5"
                                  >
                                    {item.contentType}
                                  </Badge>
                                  <span className="text-xs text-white/50 truncate">
                                    {item.soundGroup}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex-shrink-0">
                              {isSelected && (
                                <CheckCircle className="h-5 w-5 text-blue-400" />
                              )}
                              {!isSelected && isPaired && (
                                <Link className="h-4 w-4 text-green-400" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <FileAudio className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50 text-sm">
                          No files found in this construction kit.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-80 flex flex-col min-h-0 bg-black/50">
                <div className="flex-1 overflow-y-auto p-6 min-h-0">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-3">
                        Pair Type
                      </label>
                      <div className="space-y-2">
                        {pairTypes.map((type) => (
                          <div
                            key={type.name}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPairType === type.name
                                ? "bg-blue-900/30 border-blue-500/50"
                                : "bg-black/70 border-white/20 hover:border-white/40"
                              }`}
                            onClick={() => setSelectedPairType(type.name)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-white text-sm">
                                {type.name}
                              </h4>
                              {selectedPairType === type.name && (
                                <CheckCircle className="h-4 w-4 text-blue-400" />
                              )}
                            </div>
                            <p className="text-white/70 text-xs mb-2">
                              {type.description}
                            </p>

                            <div className="flex flex-wrap gap-1">
                              {type.requiredTypes.map((reqType) => (
                                <Badge
                                  key={reqType}
                                  variant="outline"
                                  className={`text-xs ${selectedTypeCounts[reqType]
                                      ? "bg-green-900/30 border-green-500/50 text-green-300"
                                      : "border-white/20 text-white/70 bg-white/5"
                                    }`}
                                >
                                  {selectedTypeCounts[reqType] ? "✓ " : ""}
                                  {reqType}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedItems.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Selected Files ({selectedItems.length})
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border border-white/10 rounded-lg p-2">
                          {selectedItems.map((id) => {
                            const item = contentItems.find((i) => i.id === id);
                            return item ? (
                              <div
                                key={id}
                                className="flex items-center justify-between p-2 bg-black/60 border border-white/20 rounded text-xs"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  {getFileIcon(item.contentType)}
                                  <span className="truncate font-medium text-white">
                                    {item.contentName}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItemSelection(id);
                                  }}
                                  className="p-1 hover:bg-white/10 rounded flex-shrink-0"
                                >
                                  <X className="h-3 w-3 text-white/70" />
                                </button>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-red-300">{error}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={createPair}
                      disabled={savingPair || selectedItems.length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 transition-colors disabled:bg-gray-800 disabled:text-white/30 disabled:cursor-not-allowed"
                    >
                      {savingPair ? (
                        "Creating..."
                      ) : (
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Create Pair
                        </div>
                      )}
                    </Button>

                    {pairs.length > 0 && (
                      <div className="pt-4 border-t border-white/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-medium text-white">
                            Created Pairs
                          </h3>
                          <span className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded">
                            {pairs.length}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {pairs.map((pair) => (
                            <div
                              key={pair.id}
                              className="p-3 bg-black/60 border border-green-500/30 rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <div>
                                  <h4 className="font-medium text-white text-sm flex items-center">
                                    <Link className="h-4 w-4 mr-2 text-green-400" />
                                    {pair.name}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1 border-white/20 text-white/70 bg-white/5"
                                  >
                                    {pair.type}
                                  </Badge>
                                </div>
                                <button
                                  onClick={() => deletePair(pair.id)}
                                  className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 text-white/70" />
                                </button>
                              </div>

                              <div className="space-y-1 max-h-24 overflow-y-auto border border-white/10 rounded-lg p-1">
                                {pair.items.map((itemId) => {
                                  const item = contentItems.find(
                                    (i) => i.id === itemId
                                  );
                                  return item ? (
                                    <div
                                      key={itemId}
                                      className="text-xs bg-black/70 p-2 rounded flex items-center gap-2"
                                    >
                                      {getFileIcon(item.contentType)}
                                      <span className="truncate text-white/70">
                                        {item.contentName}
                                      </span>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
