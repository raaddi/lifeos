"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type AppTab = "lobby" | "plan" | "progress" | "notes";
type AreaId = "work" | "sleep" | "diet" | "sport" | "business" | "learning" | "duties" | "relations" | "finance" | "environment";

type LifeArea = {
  id: AreaId;
  label: string;
  icon: string;
  color: string;
  score: number;
  goal: string;
  question: string;
  metric: string;
};

type Mission = {
  id: string;
  title: string;
  area: AreaId;
  done: boolean;
  duration: string;
};

type Profile = {
  name: string;
  height: string;
  weight: string;
  hair: string;
  face: string;
  mainFocus: string;
};

type SavedState = {
  profile: Profile;
  missions: Mission[];
  notes: string[];
};

const areas: LifeArea[] = [
  { id: "work", label: "Praca", icon: "▰", color: "#d6a05d", score: 58, goal: "Pracować skutecznie i kończyć dzień z energią.", question: "Jaki wynik ma dziś największe znaczenie?", metric: "czas i rezultat" },
  { id: "sleep", label: "Sen", icon: "◒", color: "#798cb9", score: 64, goal: "Chronić regenerację i stały rytm dobowy.", question: "O której zaczyna się wyciszenie?", metric: "długość i jakość" },
  { id: "diet", label: "Dieta", icon: "◉", color: "#8a9f69", score: 50, goal: "Jeść w sposób wspierający energię i zdrowie.", question: "Czy plan posiłków jest dziś prosty?", metric: "regularność" },
  { id: "sport", label: "Sport", icon: "↯", color: "#d66a52", score: 42, goal: "Budować sprawność bez przeciążania planu.", question: "Jaka forma ruchu pasuje do dzisiejszej energii?", metric: "ruch w tygodniu" },
  { id: "business", label: "Biznes", icon: "◆", color: "#e98145", score: 36, goal: "Zamieniać problemy ludzi w wartościowe usługi.", question: "Jaki ruch przybliży pierwszego lub następnego klienta?", metric: "sprzedaż i wartość" },
  { id: "learning", label: "Nauka", icon: "◇", color: "#5d9b92", score: 47, goal: "Uczyć się regularnie i wykorzystywać wiedzę.", question: "Czego konkretnie chcę dziś umieć więcej?", metric: "sesje skupienia" },
  { id: "duties", label: "Obowiązki", icon: "✓", color: "#a18b70", score: 61, goal: "Domykać sprawy bez trzymania ich w głowie.", question: "Co musi zostać zamknięte, żeby odzyskać spokój?", metric: "otwarte sprawy" },
  { id: "relations", label: "Relacje", icon: "∞", color: "#b16f83", score: 55, goal: "Dbać o ludzi, którzy mają znaczenie.", question: "Komu warto dziś poświęcić pełną uwagę?", metric: "jakość kontaktu" },
  { id: "finance", label: "Finanse", icon: "₿", color: "#69a581", score: 44, goal: "Budować bezpieczeństwo i świadomie kierować pieniędzmi.", question: "Czy dzisiejsze decyzje wspierają moje cele?", metric: "przepływy i rezerwa" },
  { id: "environment", label: "Otoczenie", icon: "⌂", color: "#7f8d8a", score: 70, goal: "Tworzyć przestrzeń, która ułatwia dobre działanie.", question: "Co mogę uprościć w swoim otoczeniu?", metric: "porządek i ergonomia" },
];

const initialMissions: Mission[] = [
  { id: "mission-1", title: "Wybierz jeden wynik dnia", area: "duties", done: false, duration: "3 min" },
  { id: "mission-2", title: "Zrób blok pracy głębokiej", area: "business", done: false, duration: "50 min" },
  { id: "mission-3", title: "Zadbaj o ruch albo regenerację", area: "sport", done: false, duration: "30 min" },
];

const initialProfile: Profile = {
  name: "Użytkownik",
  height: "175",
  weight: "70",
  hair: "ciemne, średniej długości",
  face: "naturalna, spokojna",
  mainFocus: "równowaga i rozwój",
};

const topTabs: Array<{ id: AppTab; label: string }> = [
  { id: "lobby", label: "Pulpit" },
  { id: "plan", label: "Plan" },
  { id: "progress", label: "Postęp" },
  { id: "notes", label: "Notatki" },
];

function areaById(id: AreaId) {
  return areas.find((area) => area.id === id) ?? areas[0];
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function polishDate() {
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
}

export default function LifeOS() {
  const [activeTab, setActiveTab] = useState<AppTab>("lobby");
  const [selectedArea, setSelectedArea] = useState<AreaId>("business");
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draftProfile, setDraftProfile] = useState<Profile>(initialProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [missionDraft, setMissionDraft] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("lifeos-lobby-v2");
      if (raw) {
        const saved = JSON.parse(raw) as SavedState;
        if (saved.profile) {
          setProfile(saved.profile);
          setDraftProfile(saved.profile);
        }
        if (Array.isArray(saved.missions)) setMissions(saved.missions);
        if (Array.isArray(saved.notes)) setNotes(saved.notes);
      }
    } catch {
      // Keep useful defaults when local storage is unavailable.
    }
    setReady(true);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("lifeos-lobby-v2", JSON.stringify({ profile, missions, notes }));
  }, [missions, notes, profile, ready]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setProfileOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const currentArea = areaById(selectedArea);
  const finished = missions.filter((mission) => mission.done).length;
  const dailyProgress = missions.length ? Math.round((finished / missions.length) * 100) : 0;
  const level = 1 + finished;

  function toggleMission(id: string) {
    setMissions((items) => items.map((mission) => mission.id === id ? { ...mission, done: !mission.done } : mission));
  }

  function addMission(event: FormEvent) {
    event.preventDefault();
    const title = missionDraft.trim();
    if (!title) return;
    setMissions((items) => [...items, { id: uid(), title, area: selectedArea, done: false, duration: "do ustalenia" }]);
    setMissionDraft("");
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    setProfile(draftProfile);
    setProfileOpen(false);
  }

  function addNote(event: FormEvent) {
    event.preventDefault();
    const note = noteDraft.trim();
    if (!note) return;
    setNotes((items) => [note, ...items]);
    setNoteDraft("");
  }

  return (
    <div className="command-app">
      <header className="game-topbar">
        <button className="wordmark" type="button" onClick={() => setActiveTab("lobby")} aria-label="Przejdź na pulpit">
          <span>L</span><strong>LifeOS</strong><em>beta</em>
        </button>
        <nav className="top-tabs" aria-label="Główne sekcje">
          {topTabs.map((tab) => (
            <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
          ))}
        </nav>
        <div className="top-status">
          <span className="sync-state"><i /> lokalny profil</span>
          <span className="date-label">{polishDate()}</span>
          <button className="profile-trigger" type="button" onClick={() => { setDraftProfile(profile); setProfileOpen(true); }} aria-label="Personalizuj postać">
            <span>{profile.name.slice(0, 1).toUpperCase()}</span>
            <i>⌄</i>
          </button>
        </div>
      </header>

      <aside className="game-dock" aria-label="Skróty">
        <div className="dock-line" />
        {[
          { tab: "lobby" as AppTab, icon: "⌂", label: "Pulpit" },
          { tab: "plan" as AppTab, icon: "▦", label: "Plan" },
          { tab: "progress" as AppTab, icon: "◫", label: "Postęp" },
          { tab: "notes" as AppTab, icon: "≡", label: "Notatki" },
        ].map((item) => (
          <button key={item.tab} type="button" className={activeTab === item.tab ? "active" : ""} onClick={() => setActiveTab(item.tab)} title={item.label}>
            <span>{item.icon}</span><small>{item.label}</small>
          </button>
        ))}
        <button className="dock-profile" type="button" onClick={() => setProfileOpen(true)} title="Postać"><span>◉</span><small>Postać</small></button>
        <div className="dock-level"><span>LVL</span><strong>{String(level).padStart(2, "0")}</strong></div>
      </aside>

      <main className="game-main">
        {activeTab === "lobby" && (
          <Lobby
            profile={profile}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            setProfileOpen={setProfileOpen}
          />
        )}
        {activeTab === "plan" && <PlanView missions={missions} toggleMission={toggleMission} />}
        {activeTab === "progress" && <ProgressView selectedArea={selectedArea} setSelectedArea={setSelectedArea} />}
        {activeTab === "notes" && <NotesView notes={notes} draft={noteDraft} setDraft={setNoteDraft} addNote={addNote} />}
      </main>

      <aside className="intel-panel">
        <section className="identity-card">
          <div>
            <span className="micro-label">Profil użytkownika</span>
            <h2>{profile.name}</h2>
            <p>{profile.mainFocus}</p>
          </div>
          <button type="button" onClick={() => { setDraftProfile(profile); setProfileOpen(true); }}>Edytuj</button>
          <div className="identity-stats"><span><strong>{profile.height}</strong> cm</span><span><strong>{profile.weight}</strong> kg</span><span><strong>LVL {level}</strong> start</span></div>
        </section>

        <section className="area-intel" style={{ "--accent": currentArea.color } as CSSProperties}>
          <div className="area-intel-top">
            <span className="area-large-icon">{currentArea.icon}</span>
            <div><span className="micro-label">Wybrany obszar</span><h2>{currentArea.label}</h2></div>
            <div className="mini-ring" style={{ "--value": `${currentArea.score * 3.6}deg` } as CSSProperties}><strong>{currentArea.score}</strong></div>
          </div>
          <p>{currentArea.goal}</p>
          <div className="reflection"><span>Pytanie na dziś</span><strong>{currentArea.question}</strong></div>
          <div className="area-metric"><span>Główna miara</span><strong>{currentArea.metric}</strong></div>
        </section>

        <section className="missions-panel">
          <div className="panel-title"><div><span className="micro-label">Plan minimum</span><h2>Dzisiejsze misje</h2></div><span>{finished}/{missions.length}</span></div>
          <div className="mission-progress"><i style={{ width: `${dailyProgress}%` }} /></div>
          <div className="mission-list">
            {missions.slice(0, 4).map((mission, index) => {
              const missionArea = areaById(mission.area);
              return (
                <button type="button" key={mission.id} className={mission.done ? "mission done" : "mission"} onClick={() => toggleMission(mission.id)}>
                  <span className="mission-index">{String(index + 1).padStart(2, "0")}</span>
                  <i className="mission-check">{mission.done ? "✓" : ""}</i>
                  <span><strong>{mission.title}</strong><small><i style={{ background: missionArea.color }} />{missionArea.label} · {mission.duration}</small></span>
                </button>
              );
            })}
          </div>
          <form className="mission-add" onSubmit={addMission}>
            <label className="sr-only" htmlFor="new-mission">Dodaj misję</label>
            <input id="new-mission" value={missionDraft} onChange={(event) => setMissionDraft(event.target.value)} placeholder="Dodaj następny krok…" />
            <button type="submit" aria-label="Dodaj misję">+</button>
          </form>
        </section>
      </aside>

      <nav className="mobile-game-nav" aria-label="Nawigacja mobilna">
        {topTabs.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}><span>{tab.id === "lobby" ? "⌂" : tab.id === "plan" ? "▦" : tab.id === "progress" ? "◫" : "≡"}</span>{tab.label}</button>)}
      </nav>

      {profileOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="modal-header"><div><span className="micro-label">Personalizacja</span><h2 id="profile-title">Zbuduj swoją postać</h2></div><button type="button" onClick={() => setProfileOpen(false)} aria-label="Zamknij">×</button></div>
            <div className="modal-body">
              <div className="avatar-preview"><img src="/avatar-default-v1.png" alt="Domyślna postać użytkownika" /><span>Domyślny awatar</span></div>
              <form className="profile-form" onSubmit={saveProfile}>
                <label><span>Nazwa postaci</span><input value={draftProfile.name} onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })} /></label>
                <div className="double-field">
                  <label><span>Wzrost (cm)</span><input type="number" min="100" max="230" value={draftProfile.height} onChange={(e) => setDraftProfile({ ...draftProfile, height: e.target.value })} /></label>
                  <label><span>Waga (kg)</span><input type="number" min="30" max="250" value={draftProfile.weight} onChange={(e) => setDraftProfile({ ...draftProfile, weight: e.target.value })} /></label>
                </div>
                <label><span>Włosy</span><input value={draftProfile.hair} onChange={(e) => setDraftProfile({ ...draftProfile, hair: e.target.value })} placeholder="kolor, długość, styl" /></label>
                <label><span>Twarz i wygląd</span><input value={draftProfile.face} onChange={(e) => setDraftProfile({ ...draftProfile, face: e.target.value })} placeholder="krótki opis cech" /></label>
                <label><span>Główny kierunek</span><input value={draftProfile.mainFocus} onChange={(e) => setDraftProfile({ ...draftProfile, mainFocus: e.target.value })} /></label>
                <div className="avatar-notice"><i>i</i><p>To neutralna postać startowa. Później będzie można wygenerować własny wygląd na podstawie opisu albo zdjęcia.</p></div>
                <button className="save-profile" type="submit">Zapisz profil postaci</button>
              </form>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function Lobby({ profile, selectedArea, setSelectedArea, setProfileOpen }: { profile: Profile; selectedArea: AreaId; setSelectedArea: (id: AreaId) => void; setProfileOpen: (open: boolean) => void }) {
  return (
    <section className="lobby-stage">
      <div className="stage-heading"><span className="micro-label">Mapa życia / tryb główny</span><h1>W centrum jesteś Ty.</h1><p>Wybierz obszar, sprawdź jego stan i ustal jeden następny ruch.</p></div>
      <div className="avatar-aura aura-one" /><div className="avatar-aura aura-two" />
      <div className="avatar-plate"><span>Aktywny profil</span><strong>{profile.name}</strong><small>{profile.height} cm · {profile.weight} kg</small></div>
      <img className="main-avatar" src="/avatar-default-v1.png" alt={`Postać użytkownika: ${profile.name}`} />
      <button className="customize-avatar" type="button" onClick={() => setProfileOpen(true)}><span>◎</span> Personalizuj postać</button>
      <div className="life-orbit" aria-label="Dziedziny życia">
        {areas.map((area) => (
          <button
            key={area.id}
            type="button"
            className={`life-node node-${area.id} ${selectedArea === area.id ? "active" : ""}`}
            style={{ "--node-color": area.color, "--node-score": `${area.score}%` } as CSSProperties}
            onClick={() => setSelectedArea(area.id)}
            aria-pressed={selectedArea === area.id}
          >
            <span className="node-icon">{area.icon}</span>
            <span className="node-copy"><strong>{area.label}</strong><small>{area.score}%</small></span>
            <i className="node-bar"><em /></i>
          </button>
        ))}
      </div>
      <div className="stage-tip"><span>Wskazówka</span><p>Nie rozwijaj wszystkiego naraz. Wybierz obszar, który dziś ogranicza resztę.</p></div>
    </section>
  );
}

function PlanView({ missions, toggleMission }: { missions: Mission[]; toggleMission: (id: string) => void }) {
  const days = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
  return (
    <section className="content-screen">
      <div className="screen-heading"><span className="micro-label">Tydzień operacyjny</span><h1>Plan bez przeciążenia</h1><p>Każdy dzień ma jeden główny wynik, blok skupienia i fundament energii.</p></div>
      <div className="week-board">
        {days.map((day, index) => <article key={day} className={index === 0 ? "today" : ""}><div><span>{day}</span><strong>{String(index + 3).padStart(2, "0")}</strong></div>{index === 0 ? missions.map((mission) => <button key={mission.id} type="button" className={mission.done ? "done" : ""} onClick={() => toggleMission(mission.id)}><i style={{ background: areaById(mission.area).color }} />{mission.title}</button>) : <button type="button" className="empty-day">+ zaplanuj wynik</button>}</article>)}
      </div>
    </section>
  );
}

function ProgressView({ selectedArea, setSelectedArea }: { selectedArea: AreaId; setSelectedArea: (id: AreaId) => void }) {
  const average = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  return (
    <section className="content-screen progress-screen">
      <div className="screen-heading"><span className="micro-label">Stan systemu</span><h1>Równowaga, nie perfekcja</h1><p>Wyniki są punktem startowym do refleksji. Nie są oceną człowieka.</p></div>
      <div className="overall-score"><span>Ogólny balans</span><strong>{average}<small>/100</small></strong><p>Największy potencjał poprawy: biznes i sport.</p></div>
      <div className="area-score-grid">{areas.map((area) => <button key={area.id} type="button" className={selectedArea === area.id ? "active" : ""} style={{ "--score-color": area.color } as CSSProperties} onClick={() => setSelectedArea(area.id)}><span>{area.icon}</span><div><strong>{area.label}</strong><i><em style={{ width: `${area.score}%` }} /></i></div><b>{area.score}</b></button>)}</div>
    </section>
  );
}

function NotesView({ notes, draft, setDraft, addNote }: { notes: string[]; draft: string; setDraft: (value: string) => void; addNote: (event: FormEvent) => void }) {
  return (
    <section className="content-screen notes-screen">
      <div className="screen-heading"><span className="micro-label">Drugi mózg</span><h1>Zapisz. Uporządkuj później.</h1><p>Jedno miejsce na pomysły, obserwacje, decyzje i rzeczy do sprawdzenia.</p></div>
      <form className="note-composer" onSubmit={addNote}><label className="sr-only" htmlFor="note">Nowa notatka</label><textarea id="note" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Co chodzi Ci teraz po głowie?" /><button type="submit">Zapisz notatkę</button></form>
      <div className="note-grid">{notes.length ? notes.map((note, index) => <article key={`${note}-${index}`}><span>NOTATKA {String(notes.length - index).padStart(2, "0")}</span><p>{note}</p></article>) : <article className="empty-note"><span>PUSTY INBOX</span><p>Pierwsza notatka pojawi się właśnie tutaj.</p></article>}</div>
    </section>
  );
}
