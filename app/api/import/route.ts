import { NextResponse } from "next/server";
import prisma from "@/app/lib/database";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const awsKeysStr = formData.get("awsKeys") as string;
    const awsKeys = JSON.parse(awsKeysStr);
    const contentType = formData.get("contentType") as string;
    const contentName = formData.get("contentName") as string;
    const bpm = formData.get("bpm") as string;
    const key = formData.get("key") as string;
    const soundGroup = formData.get("soundGroup") as string;
    const subGroup = formData.get("subGroup") as string;
    const styles = JSON.parse(formData.get("styles") as string);
    const moods = JSON.parse(formData.get("moods") as string);
    const processing = JSON.parse(formData.get("processing") as string);
    const soundDesign = JSON.parse(formData.get("soundDesign") as string);

    let result;

    await prisma.$transaction(
      async (tx) => {
        const metadata = await tx.metadata.create({
          data: {
            styles,
            moods,
            processing,
            soundDesign,
            bpm,
            key,
          },
        });

        if (contentType === "Sample Loop+MIDI") {
          const audioKey = awsKeys.find((key: string) => !key.endsWith(".mid"));
          const midiKey = awsKeys.find((key: string) => key.endsWith(".mid"));

          if (!audioKey || !midiKey) {
            throw new Error("Missing audio or MIDI file");
          }

          const loopContent = await tx.content.create({
            data: {
              id: uuidv4(),
              contentName: `${contentName} - Loop`,
              contentType: "Sample Loop",
              soundGroup,
              subGroup,
              file: {
                create: {
                  id: uuidv4(),
                  fileName: audioKey.split("/").pop() || "",
                  awsKey: audioKey,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });

          const midiContent = await tx.content.create({
            data: {
              id: uuidv4(),
              contentName: `${contentName} - MIDI`,
              contentType: "MIDI",
              soundGroup,
              subGroup,
              file: {
                create: {
                  id: uuidv4(),
                  fileName: midiKey.split("/").pop() || "",
                  awsKey: midiKey,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });

          result = await tx.loopandmidi.create({
            data: {
              name: contentName,
              loopContent: {
                connect: {
                  id: loopContent.id,
                },
              },
              midiContent: {
                connect: {
                  id: midiContent.id,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });
        } else if (contentType === "Preset") {
          const audioKey = awsKeys.find(
            (key: string) =>
              key.toLowerCase().endsWith(".wav") ||
              key.toLowerCase().endsWith(".mp3")
          );
          const midiKey = awsKeys.find((key: string) =>
            key.toLowerCase().endsWith(".mid")
          );

          const presetKey = awsKeys.find(
            (key: string) =>
              key.toLowerCase().endsWith(".serumpreset") ||
              key.toLowerCase().endsWith(".h2p")
          );

          if (!audioKey || !midiKey || !presetKey) {
            throw new Error("Missing required files for preset");
          }

          const loopContent = await tx.content.create({
            data: {
              id: uuidv4(),
              contentName: `${contentName} - Audio`,
              contentType: "Sample Loop",
              soundGroup,
              subGroup,
              file: {
                create: {
                  id: uuidv4(),
                  fileName: audioKey.split("/").pop() || "",
                  awsKey: audioKey,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });

          const midiContent = await tx.content.create({
            data: {
              id: uuidv4(),
              contentName: `${contentName} - MIDI`,
              contentType: "MIDI",
              soundGroup,
              subGroup,
              file: {
                create: {
                  id: uuidv4(),
                  fileName: midiKey.split("/").pop() || "",
                  awsKey: midiKey,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });

          const presetContent = await tx.content.create({
            data: {
              id: uuidv4(),
              contentName: `${contentName} - Preset`,
              contentType: "Preset File",
              soundGroup,
              subGroup,
              file: {
                create: {
                  id: uuidv4(),
                  fileName: presetKey.split("/").pop() || "",
                  awsKey: presetKey,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });

          result = await tx.preset.create({
            data: {
              name: contentName,
              loopContent: {
                connect: {
                  id: loopContent.id,
                },
              },
              midiContent: {
                connect: {
                  id: midiContent.id,
                },
              },
              presetContent: {
                connect: {
                  id: presetContent.id,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });
        } else {
          result = await tx.content.create({
            data: {
              id: uuidv4(),
              contentName,
              contentType,
              soundGroup,
              subGroup,
              file: {
                create: {
                  id: uuidv4(),
                  fileName: (awsKeys[0] as string).split("/").pop() || "",
                  awsKey: awsKeys[0] as string,
                },
              },
              metadata: {
                connect: {
                  id: metadata.id,
                },
              },
            },
          });
        }
      },
      {
        timeout: 15000,
        maxWait: 10000,
      }
    );

    return NextResponse.json(
      { message: "Content imported successfully", content: result },
      { status: 201 }
    );
  } catch (error: Error | unknown) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export const GET = async () => {
  try {
    const constructionKits = await prisma.constructionkit.findMany({
      select: {
        id: true,
        kitName: true,
        createdAt: true,
        metadataId: true,
        metadata: {
          select: {
            bpm: true,
            key: true,
            styles: true,
            moods: true,
          },
        },
        contents: {
          select: {
            id: true,
            contentName: true,
            contentType: true,
            file: { select: { fileName: true, awsKey: true } },
          },
        },
        loopAndMidis: {
          select: {
            id: true,
            name: true,
            loopContent: {
              select: {
                id: true,
                contentName: true,
                contentType: true,
                file: { select: { fileName: true, awsKey: true } },
              },
            },
            midiContent: {
              select: {
                id: true,
                contentName: true,
                contentType: true,
                file: { select: { fileName: true, awsKey: true } },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        presets: {
          select: {
            id: true,
            name: true,
            loopContent: {
              select: {
                id: true,
                contentName: true,
                contentType: true,
                file: { select: { fileName: true, awsKey: true } },
              },
            },
            midiContent: {
              select: {
                id: true,
                contentName: true,
                contentType: true,
                file: { select: { fileName: true, awsKey: true } },
              },
            },
            presetContent: {
              select: {
                id: true,
                contentName: true,
                contentType: true,
                file: { select: { fileName: true, awsKey: true } },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    const usedContentIds = constructionKits
      .flatMap((kit) => [
        ...kit.contents.map((content) => content.id),
        ...kit.presets.map((preset) => preset.id),
        ...kit.loopAndMidis.map((loopAndMidi) => loopAndMidi.id),
        ...kit.presets.flatMap((preset) => [
          preset.loopContent?.id,
          preset.midiContent?.id,
          preset.presetContent?.id,
        ]),
        ...kit.loopAndMidis.flatMap((lm) => [
          lm.loopContent?.id,
          lm.midiContent?.id,
        ]),
      ])
      .filter((id): id is string => id !== null);

    const presets = await prisma.preset.findMany({
      where: {
        id: {
          notIn: usedContentIds,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        loopContentId: true,
        midiContentId: true,
        presetContentId: true,
        metadata: {
          select: {
            bpm: true,
            key: true,
          },
        },
        loopContent: {
          select: {
            id: true,
            contentName: true,
            contentType: true,
            file: { select: { fileName: true, awsKey: true } },
          },
        },
        midiContent: {
          select: {
            id: true,
            contentName: true,
            contentType: true,
            file: { select: { fileName: true, awsKey: true } },
          },
        },
        presetContent: {
          select: {
            id: true,
            contentName: true,
            contentType: true,
            file: { select: { fileName: true, awsKey: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const loopandmidis = await prisma.loopandmidi.findMany({
      where: {
        id: {
          notIn: usedContentIds,
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        loopContentId: true,
        midiContentId: true,
        metadata: {
          select: {
            bpm: true,
            key: true,
          },
        },
        loopContent: {
          select: {
            id: true,
            contentName: true,
            contentType: true,
            file: { select: { fileName: true, awsKey: true } },
          },
        },
        midiContent: {
          select: {
            id: true,
            contentName: true,
            contentType: true,
            file: { select: { fileName: true, awsKey: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const usedIds = [
      ...presets.map((x) => x.presetContentId),
      ...presets.map((x) => x.loopContentId),
      ...presets.map((x) => x.midiContentId),
      ...loopandmidis.map((x) => x.loopContentId),
      ...loopandmidis.map((x) => x.midiContentId),
    ].filter((id): id is string => id !== null);

    const finalUsedIds = Array.from(new Set([...usedIds, ...usedContentIds]));
    const contents = await prisma.content.findMany({
      where: {
        id: {
          notIn: finalUsedIds,
        },
      },
      select: {
        id: true,
        contentName: true,
        contentType: true,
        createdAt: true,
        metadata: {
          select: {
            bpm: true,
            key: true,
          },
        },
        file: {
          select: {
            fileName: true,
            awsKey: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const mappedContents = contents.map((content) => ({
      id: content.id,
      name: content.contentName,
      contentType: content.contentType,
      createdAt: content.createdAt.toISOString(),
      metadata: {
        bpm: content.metadata?.bpm,
        key: content.metadata?.key,
      },
      file: {
        name: content.file.fileName,
        key: content.file.awsKey,
      },
    }));

    const mappedPresets = presets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      contentType: "Preset Bundle",
      createdAt: preset.createdAt.toISOString(),
      metadata: {
        bpm: preset.metadata?.bpm,
        key: preset.metadata?.key,
      },
      files: [
        preset.loopContent && {
          type: "AUDIO",
          name: preset.loopContent.file.fileName,
          key: preset.loopContent.file.awsKey,
          contentId: preset.loopContent.id,
        },
        preset.midiContent && {
          type: "MIDI",
          name: preset.midiContent.file.fileName,
          key: preset.midiContent.file.awsKey,
          contentId: preset.midiContent.id,
        },
        preset.presetContent && {
          type: "PRESET",
          name: preset.presetContent.file.fileName,
          key: preset.presetContent.file.awsKey,
          contentId: preset.presetContent.id,
        },
      ].filter(Boolean),
    }));

    const mappedLoopAndMidi = loopandmidis.map((lm) => ({
      id: lm.id,
      name: lm.name,
      contentType: "Loop+MIDI Bundle",
      createdAt: lm.createdAt.toISOString(),
      metadata: {
        bpm: lm.metadata?.bpm,
        key: lm.metadata?.key,
      },
      files: [
        lm.loopContent && {
          type: "AUDIO",
          name: lm.loopContent.file.fileName,
          key: lm.loopContent.file.awsKey,
          contentId: lm.loopContent.id,
        },
        lm.midiContent && {
          type: "MIDI",
          name: lm.midiContent.file.fileName,
          key: lm.midiContent.file.awsKey,
          contentId: lm.midiContent.id,
        },
      ].filter(Boolean),
    }));
    const mappedConstructionKits = constructionKits.map((kit) => ({
      id: kit.id,
      name: kit.kitName,
      contentType: "Construction Kit",
      createdAt: kit.createdAt.toISOString(),
      contents: kit.contents.length,
      presets: kit.presets.length,
      loopAndMidis: kit.loopAndMidis.length,
      metadata: {
        bpm: kit.metadata?.bpm || "",
        key: kit.metadata?.key || "",
        styles: kit.metadata?.styles || [],
        moods: kit.metadata?.moods || [],
      },
    }));

    const combinedData = [
      ...mappedContents,
      ...mappedPresets,
      ...mappedLoopAndMidi,
      ...mappedConstructionKits,
    ];
    combinedData.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ content: combinedData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching contents:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contents",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
};
