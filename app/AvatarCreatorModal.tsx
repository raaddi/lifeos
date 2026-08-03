"use client";

import { useEffect, useRef } from "react";

type AvatarCreatorModalProps = {
  onAvatar: (url: string) => void;
  onClose: () => void;
};

const CREATOR_ORIGIN = "https://demo.readyplayer.me";

type CreatorMessage = {
  source?: string;
  eventName?: string;
  data?: { url?: string };
};

export default function AvatarCreatorModal({ onAvatar, onClose }: AvatarCreatorModalProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function receiveMessage(event: MessageEvent) {
      if (event.origin !== CREATOR_ORIGIN) return;

      let message: CreatorMessage;
      try {
        message = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch {
        return;
      }

      if (message?.source !== "readyplayerme") return;

      if (message.eventName === "v1.frame.ready") {
        frameRef.current?.contentWindow?.postMessage(
          JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.**" }),
          CREATOR_ORIGIN,
        );
      }

      if (message.eventName === "v1.avatar.exported" && message.data?.url) {
        onAvatar(message.data.url);
      }
    }

    window.addEventListener("message", receiveMessage);
    return () => window.removeEventListener("message", receiveMessage);
  }, [onAvatar]);

  return (
    <div className="modal-backdrop creator-backdrop" role="presentation">
      <section className="creator-modal" role="dialog" aria-modal="true" aria-labelledby="creator-title">
        <div className="modal-header">
          <div><span className="micro-label">Realistyczna postać 3D</span><h2 id="creator-title">Stwórz swojego awatara</h2></div>
          <button type="button" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="creator-info">
          <span>01. zdjęcie lub preset</span><i />
          <span>02. twarz, włosy i ubranie</span><i />
          <span>03. gotowy model 3D</span>
        </div>
        <iframe
          ref={frameRef}
          title="Kreator realistycznej postaci 3D"
          src={`${CREATOR_ORIGIN}/avatar?frameApi&bodyType=fullbody`}
          allow="camera *; microphone *; clipboard-write"
        />
      </section>
    </div>
  );
}
