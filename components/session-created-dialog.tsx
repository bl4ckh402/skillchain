"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SessionCreatedDialog({
  onClose,
  sessionId,
  sessionTitle,
  onStartSession,
  onCopyInvitation,
}: {
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
  onStartSession: () => void | Promise<void>;
  onCopyInvitation: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const invitation = `${window.location.origin}/live-session/session/${sessionId}`;
    try {
      await navigator.clipboard.writeText(invitation);
      setCopied(true);
      onCopyInvitation && onCopyInvitation();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#1e2133] rounded-lg w-full max-w-md p-6 text-center">
        <div className="bg-emerald-600 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-white text-2xl font-bold mb-6">Session Created</h2>

        <Button
          className="w-full mb-3 bg-emerald-600 hover:bg-emerald-700"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 mr-2 text-white" />
          ) : (
            <Copy className="h-4 w-4 mr-2" />
          )}
          {copied ? "Copied!" : "Copy Invitation"}
        </Button>

        <Button
          variant="ghost"
          className="w-full text-gray-300 hover:bg-gray-800"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
