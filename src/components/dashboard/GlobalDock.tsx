"use client";

import { MagnificationDock } from "@/components/ui/MagnificationDock";
import { Home, Search, ShieldAlert, Settings, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function GlobalDock() {
  const router = useRouter();

  const dockItems = [
    {
      label: "Home",
      icon: <Home size={20} />,
      onClick: () => router.push('/dashboard')
    },
    {
      label: "Search",
      icon: <Search size={20} />,
      onClick: () => {
        // Implement search
      }
    },
    {
      label: "Issues",
      icon: <ShieldAlert size={20} />,
      onClick: () => {
        // Implement issues
      }
    },
    {
      label: "Profile",
      icon: <User size={20} />,
      onClick: () => {
        // Implement profile
      }
    },
    {
      label: "Settings",
      icon: <Settings size={20} />,
      onClick: () => router.push('/settings')
    }
  ];

  return (
    <div className="fixed bottom-4 left-0 w-full z-50 pointer-events-none">
      <MagnificationDock
        items={dockItems}
        baseItemSize={48}
        magnification={70}
      />
    </div>
  );
}
