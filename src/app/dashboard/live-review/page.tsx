import LiveReviewDashboard from "@/components/dashboard/LiveReviewDashboard";

export const metadata = {
  title: "Live Review — Kareixo",
  description: "Real-time visualization of the AI review pipeline, sandbox execution, and model routing.",
};

export default function LiveReviewPage() {
  return <LiveReviewDashboard />;
}
