"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { bodyComposition } from "./bodyMath";

const Avatar3D = dynamic(() => import("./Avatar3D"), {
  ssr: false,
  loading: () => <div className="avatar-loading"><span>Ładowanie modelu 3D</span><i /></div>,
});

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

type Routine = {
  id: string;
  label: string;
  time: string;
  done: boolean;
};

type Profile = {
  name: string;
  height: string;
  weight: string;
  bodyFat: string;
  mainFocus: string;
};

type SavedState = {
  profile: Profile;
  missions: Mission[];
  notes: string[];
  routines?: Routine[];
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

const initialRoutines: Routine[] = [
  { id: "routine-1", label: "Poranny start bez telefonu", time: "rano", done: false },
  { id: "routine-2", label: "Ruch lub trening", time: "30 min", done: false },
  { id: "routine-3", label: "Przegląd dnia i wyciszenie", time: "wieczór", done: false },
];

const initialProfile: Profile = {
  name: "Użytkownik",
  height: "175",
  weight: "70",
  bodyFat: "18",
  mainFocus: "równowaga i rozwój",
};

const topTabs: Array<{ id: AppTab; label: string }> = [
  { id: "lobby", label: "Dzisiaj" },
  { id: "plan", label: "Plan tygodnia" },
  { id: "progress", label: "Obszary" },
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
  const [routines, setRoutines] = useState<Routine[]>(initialRoutines);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [draftProfile, setDraftProfile] = useState<Profile>(initialProfile);
  const [profileOpen, setProfileOpen] = useState(false);
  const [missionDraft, setMissionDraft] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreProfile = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem("lifeos-lobby-v2");
        if (raw) {
          const saved = JSON.parse(raw) as SavedState;
          if (saved.profile) {
            const completeProfile = { ...initialProfile, ...saved.profile };
            setProfile(completeProfile);
            setDraftProfile(completeProfile);
          }
          if (Array.isArray(saved.missions)) setMissions(saved.missions);
          if (Array.isArray(saved.notes)) setNotes(saved.notes);
          if (Array.isArray(saved.routines)) setRoutines(saved.routines);
        }
      } catch {
        // Keep useful defaults when local storage is unavailable.
      }
      setReady(true);
    }, 0);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    return () => window.clearTimeout(restoreProfile);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("lifeos-lobby-v2", JSON.stringify({ profile, missions, notes, routines }));
  }, [missions, notes, profile, ready, routines]);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  const finished = missions.filter((mission) => mission.done).length;
  const level = 1 + finished;

  function toggleMission(id: string) {
    setMissions((items) => items.map((mission) => mission.id === id ? { ...mission, done: !mission.done } : mission));
  }

  function toggleRoutine(id: string) {
    setRoutines((items) => items.map((routine) => routine.id === id ? { ...routine, done: !routine.done } : routine));
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
          { tab: "lobby" as AppTab, icon: "⌂", label: "Dzisiaj" },
          { tab: "plan" as AppTab, icon: "▦", label: "Tydzień" },
          { tab: "progress" as AppTab, icon: "◫", label: "Obszary" },
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
          <Dashboard
            profile={profile}
            selectedArea={selectedArea}
            setSelectedArea={setSelectedArea}
            setProfileOpen={setProfileOpen}
            missions={missions}
            toggleMission={toggleMission}
            missionDraft={missionDraft}
            setMissionDraft={setMissionDraft}
            addMission={addMission}
            notes={notes}
            noteDraft={noteDraft}
            setNoteDraft={setNoteDraft}
            addNote={addNote}
            routines={routines}
            toggleRoutine={toggleRoutine}
            openPlan={() => setActiveTab("plan")}
          />
        )}
        {activeTab === "plan" && <PlanView missions={missions} toggleMission={toggleMission} />}
        {activeTab === "progress" && <ProgressView selectedArea={selectedArea} setSelectedArea={setSelectedArea} />}
        {activeTab === "notes" && <NotesView notes={notes} draft={noteDraft} setDraft={setNoteDraft} addNote={addNote} />}
      </main>

      <nav className="mobile-game-nav" aria-label="Nawigacja mobilna">
        {topTabs.map((tab) => <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}><span>{tab.id === "lobby" ? "⌂" : tab.id === "plan" ? "▦" : tab.id === "progress" ? "◫" : "≡"}</span>{tab.label}</button>)}
      </nav>

      {profileOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setProfileOpen(false); }}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="modal-header"><div><span className="micro-label">Personalizacja</span><h2 id="profile-title">Ustaw profil postaci</h2></div><button type="button" onClick={() => setProfileOpen(false)} aria-label="Zamknij">×</button></div>
            <div className="modal-body">
              <div className="avatar-preview">
                <div className="avatar-preview-copy"><span>Parametryczny model 3D</span><strong>Anatomia reagująca na dane</strong><p>Postać jest ubrana wyłącznie w dopasowane bokserki. Wzrost, masa, body fat oraz obliczona masa mięśniowa sterują rzeczywistymi deformacjami siatki.</p></div>
              </div>
              <form className="profile-form" onSubmit={saveProfile}>
                <label><span>Nazwa postaci</span><input value={draftProfile.name} onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })} /></label>
                <div className="double-field">
                  <label><span>Wzrost (cm)</span><input type="number" min="100" max="230" value={draftProfile.height} onChange={(e) => setDraftProfile({ ...draftProfile, height: e.target.value })} /></label>
                  <label><span>Waga (kg)</span><input type="number" min="30" max="250" value={draftProfile.weight} onChange={(e) => setDraftProfile({ ...draftProfile, weight: e.target.value })} /></label>
                </div>
                <label><span>Poziom tkanki tłuszczowej (%)</span><input type="number" min="4" max="50" value={draftProfile.bodyFat} onChange={(e) => setDraftProfile({ ...draftProfile, bodyFat: e.target.value })} /></label>
                <label><span>Główny kierunek</span><input value={draftProfile.mainFocus} onChange={(e) => setDraftProfile({ ...draftProfile, mainFocus: e.target.value })} /></label>
                <div className="avatar-notice"><i>i</i><p>Zmiana danych natychmiast przebudowuje sylwetkę. To wizualizacja orientacyjna oparta na FFMI i body fat, a nie medyczny skan ciała.</p></div>
                <button className="save-profile" type="submit">Zapisz profil postaci</button>
              </form>
            </div>
          </section>
        </div>
      )}

    </div>
  );
}

type DashboardProps = {
  profile: Profile;
  selectedArea: AreaId;
  setSelectedArea: (id: AreaId) => void;
  setProfileOpen: (open: boolean) => void;
  missions: Mission[];
  toggleMission: (id: string) => void;
  missionDraft: string;
  setMissionDraft: (value: string) => void;
  addMission: (event: FormEvent) => void;
  notes: string[];
  noteDraft: string;
  setNoteDraft: (value: string) => void;
  addNote: (event: FormEvent) => void;
  routines: Routine[];
  toggleRoutine: (id: string) => void;
  openPlan: () => void;
};

function Dashboard({
  profile,
  selectedArea,
  setSelectedArea,
  setProfileOpen,
  missions,
  toggleMission,
  missionDraft,
  setMissionDraft,
  addMission,
  notes,
  noteDraft,
  setNoteDraft,
  addNote,
  routines,
  toggleRoutine,
  openPlan,
}: DashboardProps) {
  const height = Number(profile.height) || 175;
  const weight = Number(profile.weight) || 70;
  const bodyFat = Number(profile.bodyFat) || 18;
  const composition = bodyComposition(height, weight, bodyFat);
  const overallBalance = Math.round(areas.reduce((sum, area) => sum + area.score, 0) / areas.length);
  const finished = missions.filter((mission) => mission.done).length;
  const progress = missions.length ? Math.round((finished / missions.length) * 100) : 0;
  const routinesDone = routines.filter((routine) => routine.done).length;
  const activeArea = areaById(selectedArea);
  const nextMission = missions.find((mission) => !mission.done);
  const weekDays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Ndz"];
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <section className="life-dashboard">
      <header className="dashboard-heading">
        <div>
          <span className="micro-label">Twój LifeOS / {polishDate()}</span>
          <h1>Wszystko, co ważne. W jednym miejscu.</h1>
          <p>Plan dnia, szybkie notatki, rutyny i pełny obraz życia — bez trzymania wszystkiego w głowie.</p>
        </div>
        <div className="dashboard-summary" aria-label="Podsumowanie dnia">
          <span><small>Zadania</small><strong>{finished}/{missions.length}</strong></span>
          <span><small>Rutyny</small><strong>{routinesDone}/{routines.length}</strong></span>
          <span><small>Balans</small><strong>{overallBalance}</strong></span>
        </div>
      </header>

      <div className="dashboard-grid">
        <section className="dash-card today-card">
          <div className="dash-card-heading">
            <div><span className="micro-label">Dzisiaj</span><h2>Plan dnia</h2></div>
            <div className="day-progress"><span>{progress}%</span><i><em style={{ width: `${progress}%` }} /></i></div>
          </div>
          <div className={nextMission ? "main-outcome" : "main-outcome complete"}>
            <span>Najważniejszy następny ruch</span>
            <strong>{nextMission?.title ?? "Plan minimum wykonany"}</strong>
            <small>{nextMission ? `${areaById(nextMission.area).label} · ${nextMission.duration}` : "Możesz zakończyć dzień albo dodać kolejny krok."}</small>
          </div>
          <div className="dashboard-task-list">
            {missions.map((mission) => {
              const missionArea = areaById(mission.area);
              return (
                <button key={mission.id} type="button" className={mission.done ? "dashboard-task done" : "dashboard-task"} onClick={() => toggleMission(mission.id)}>
                  <i className="task-check">{mission.done ? "✓" : ""}</i>
                  <span><strong>{mission.title}</strong><small><i style={{ background: missionArea.color }} />{missionArea.label} · {mission.duration}</small></span>
                  <b>{mission.done ? "Gotowe" : "Do zrobienia"}</b>
                </button>
              );
            })}
          </div>
          <form className="dashboard-add" onSubmit={addMission}>
            <label className="sr-only" htmlFor="dashboard-mission">Dodaj zadanie</label>
            <span style={{ "--capture-color": activeArea.color } as CSSProperties}>{activeArea.icon} {activeArea.label}</span>
            <input id="dashboard-mission" value={missionDraft} onChange={(event) => setMissionDraft(event.target.value)} placeholder="Dodaj następny konkretny krok…" />
            <button type="submit">Dodaj</button>
          </form>
        </section>

        <section className="dash-card capture-card">
          <div className="dash-card-heading"><div><span className="micro-label">Inbox</span><h2>Szybki zapis</h2></div><span className="card-count">{notes.length}</span></div>
          <form className="quick-note" onSubmit={addNote}>
            <label className="sr-only" htmlFor="dashboard-note">Szybka notatka</label>
            <textarea id="dashboard-note" value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Pomysł, decyzja, rzecz do sprawdzenia…" />
            <div><span>Zapisz teraz. Uporządkuj później.</span><button type="submit">Zapisz notatkę</button></div>
          </form>
          <div className="recent-notes">
            <span className="micro-label">Ostatnie notatki</span>
            {notes.length ? notes.slice(0, 3).map((note, index) => <article key={`${note}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{note}</p></article>) : <div className="notes-empty">Inbox jest pusty. Pierwsza myśl pojawi się tutaj.</div>}
          </div>
        </section>

        <section className="dash-card week-card">
          <div className="dash-card-heading"><div><span className="micro-label">Perspektywa</span><h2>Ten tydzień</h2></div><button type="button" onClick={openPlan}>Otwórz pełny plan ↗</button></div>
          <div className="week-strip">
            {weekDays.map((day, index) => (
              <div key={day} className={index === todayIndex ? "today" : ""}>
                <span>{day}</span><strong>{index === todayIndex ? missions.length : "—"}</strong><small>{index === todayIndex ? "zadań" : "bez planu"}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-card routines-card">
          <div className="dash-card-heading"><div><span className="micro-label">Powtarzalność</span><h2>Rutyny dnia</h2></div><span className="card-count">{routinesDone}/{routines.length}</span></div>
          <div className="routine-list">
            {routines.map((routine) => (
              <button key={routine.id} type="button" className={routine.done ? "routine-row done" : "routine-row"} onClick={() => toggleRoutine(routine.id)}>
                <i>{routine.done ? "✓" : ""}</i><span><strong>{routine.label}</strong><small>{routine.time}</small></span>
              </button>
            ))}
          </div>
        </section>

        <section className="dash-card areas-card">
          <div className="dash-card-heading"><div><span className="micro-label">Pełny obraz</span><h2>Obszary życia</h2></div><span className="selected-area-label"><i style={{ background: activeArea.color }} />Priorytet: {activeArea.label}</span></div>
          <div className="dashboard-areas">
            {areas.map((area) => (
              <button key={area.id} type="button" className={selectedArea === area.id ? "active" : ""} style={{ "--area-color": area.color, "--area-score": `${area.score}%` } as CSSProperties} onClick={() => setSelectedArea(area.id)}>
                <span>{area.icon}</span><div><strong>{area.label}</strong><i><em /></i></div><b>{area.score}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="dash-card profile-card">
          <div className="dash-card-heading"><div><span className="micro-label">Profil</span><h2>{profile.name}</h2></div><button type="button" onClick={() => setProfileOpen(true)}>Edytuj ↗</button></div>
          <div className="profile-visual">
            <Avatar3D heightCm={height} weightKg={weight} bodyFat={bodyFat} />
          </div>
          <div className="profile-numbers">
            <span><small>Wzrost</small><strong>{height} cm</strong></span>
            <span><small>Waga</small><strong>{weight} kg</strong></span>
            <span><small>FFMI</small><strong>{composition.ffmi.toFixed(1)}</strong></span>
          </div>
          <p>Postać i parametry ciała są częścią profilu — nie centrum całego systemu.</p>
        </section>
      </div>
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
