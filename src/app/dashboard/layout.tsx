import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <div className="min-h-full bg-background font-body-base text-text-primary antialiased selection:bg-secondary-fixed selection:text-on-secondary-fixed">
      <Sidebar user={session.user} />
      <div className="pl-[240px]">
        <DashboardHeader user={session.user} />

        <main className="pt-14 w-full min-h-screen bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
