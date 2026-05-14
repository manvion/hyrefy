import { FileText } from "lucide-react";
import { BuildClient } from "@/components/build/build-client";

export const metadata = { title: "Build Resume | Hyrefy" };

export default function BuildPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Build Resume from Scratch</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Fill in each section — use the AI fix button to improve any part instantly.
        </p>
      </div>
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <BuildClient />
      </div>
    </div>
  );
}
