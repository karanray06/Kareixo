import HeatmapCodeViewer from "@/components/dashboard/HeatmapCodeViewer";

export const metadata = {
  title: "Bug Heatmap — Kareixo",
  description: "AI-powered line-level defect probability analysis with visual heatmap.",
};

export default function HeatmapPage() {
  return (
    <div className="flex flex-col w-full">
      <div className="max-w-[1100px] w-full mx-auto px-space-6 py-space-8 flex flex-col gap-space-6">
        <div className="flex flex-col gap-1 pb-space-4 border-b border-border-default">
          <h1 className="font-headline-section text-headline-section text-fg-default tracking-tight">
            Bug Heatmap
          </h1>
          <p className="font-body-base text-body-base text-fg-muted">
            Paste code to get AI-powered line-level defect probability analysis
          </p>
        </div>
        <HeatmapCodeViewer />
      </div>
    </div>
  );
}
