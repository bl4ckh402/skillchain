import { StreamClientProvider as VideoProvider } from "@/context/StreamClientProvider";
import type { ReactNode } from "react";

export default function LiveSessionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <VideoProvider>{children}</VideoProvider>;
}
