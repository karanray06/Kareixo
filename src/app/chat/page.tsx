import Navbar from "@/components/landing/Navbar";
import ChatClient from "./ChatClient";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/chat");
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-base)]">
      <div className="flex-none">
        <Navbar />
      </div>
      
      <div className="flex-1 pt-20 pb-4 px-4 max-w-6xl mx-auto w-full">
        <div className="h-full rounded-2xl border border-[var(--color-outline)]/20 overflow-hidden shadow-2xl">
          <ChatClient />
        </div>
      </div>
    </div>
  );
}
