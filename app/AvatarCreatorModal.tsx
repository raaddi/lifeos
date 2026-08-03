"use client";

import Avatar3D from "./Avatar3D";

type AvatarCreatorModalProps = {
  onAvatar: (url: string) => void;
  onClose: () => void;
};

const presets = [
  { url: "/models/avatar-01.glb", name: "Postać 01", detail: "pełna postać · model riggowany" },
  { url: "/models/avatar-02.glb", name: "Postać 02", detail: "pełna postać · model riggowany" },
];

export default function AvatarCreatorModal({ onAvatar, onClose }: AvatarCreatorModalProps) {
  return (
    <div className="modal-backdrop creator-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="creator-modal preset-creator" role="dialog" aria-modal="true" aria-labelledby="creator-title">
        <div className="modal-header">
          <div><span className="micro-label">Biblioteka postaci</span><h2 id="creator-title">Wybierz model zapisany w aplikacji</h2></div>
          <button type="button" onClick={onClose} aria-label="Zamknij">×</button>
        </div>
        <div className="creator-info">
          <span>Modele działają bez zewnętrznych serwerów</span><i />
          <span>Obrót i zoom są dostępne na pulpicie</span>
        </div>
        <div className="preset-grid">
          {presets.map((preset) => (
            <article className="preset-card" key={preset.url}>
              <div className="preset-model"><Avatar3D modelUrl={preset.url} compact /></div>
              <div className="preset-copy"><div><span>MODEL 3D</span><strong>{preset.name}</strong><small>{preset.detail}</small></div><button type="button" onClick={() => onAvatar(preset.url)}>Wybierz postać</button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
