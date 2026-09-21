import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPipelineRun, getLatestPipelineRun } from "@/lib/pipeline-events";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Special case: "latest" returns the most recent pipeline run
    const run = id === "latest" ? getLatestPipelineRun() : getPipelineRun(id);

    if (!run) {
      return NextResponse.json(
        { error: "Pipeline run not found", reviewId: id },
        { status: 404 }
      );
    }

    return NextResponse.json(run, {
      headers: {
        // Allow short polling with cache-control
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Pipeline status error:", error);
    return NextResponse.json(
      { error: "Internal Error" },
      { status: 500 }
    );
  }
}
