import ContentList from "@/app/components/general/contentList";

interface ContentItem {
  id: string;
  contentType: string;
  contentName: string;
  bpm: string;
  key: string;
  soundGroup: string;
  subGroup: string;
  styles: string[];
  moods: string[];
  processing: string[];
  soundDesign: string[];
  createdAt: string;
  fileId: string;
  file: {
    fileName: string;
    fileUrl: string;
    awsKey: string;
  };
}
interface ConstructionKit {
  id: string;
  kitName: string;
  description: string;
  bpm: string;
  key: string;
  styles: string[];
  moods: string[];
  userId: string;
  contents: ContentItem[];
  createdAt: string;
}

export default async function Home() {
  let content: ContentItem[] = [];
  let constructionKits: ConstructionKit[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/content`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch content: ${res.statusText}`);
    }

    const data = await res.json();

    content = data.contents as ContentItem[];
    constructionKits = data.constructionKit as ConstructionKit[];
  } catch (error: Error | unknown) {
    console.error("Error fetching content:", error);
    content = [];
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ContentList
        items={content}
        constructionKits={constructionKits}
        showKits={true}
      />
    </main>
  );
}
