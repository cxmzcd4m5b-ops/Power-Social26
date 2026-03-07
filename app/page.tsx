import MediaUploader from "@/components/MediaUploader";
import SetupBanner from "@/components/SetupBanner";
import { Hammer } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Hammer className="w-12 h-12 text-amber-900" />
            <h1 className="text-5xl font-bold text-amber-900">
              Power Social
            </h1>
          </div>
          <p className="text-xl text-amber-800 max-w-2xl mx-auto">
            Transform your log cabin construction clips into viral social media content
          </p>
          <p className="text-md text-amber-700 mt-2">
            Upload videos or pictures • AI analyzes & creates shorts • Trending captions • Platform-optimized
          </p>
        </header>

        <SetupBanner />
        <MediaUploader />
      </div>
    </main>
  );
}
