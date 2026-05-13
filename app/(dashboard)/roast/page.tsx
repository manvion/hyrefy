import { RoastClient } from "@/components/roast/roast-client";
import { Flame } from "lucide-react";

export const metadata = { title: "Resume Roast | Hyrefy" };

export default function RoastPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold">Resume Roast</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Brutal honest feedback from an AI that&apos;s reviewed 10,000+ resumes. No sugar-coating. Just real fixes.
        </p>
      </div>
      <RoastClient />
    </div>
  );
}
