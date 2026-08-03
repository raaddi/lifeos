"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type View = "today" | "tasks" | "projects" | "dxcomp" | "learning" | "routines" | "review";
type Area = "DxComp" | "Studia" | "Niemiecki" | "Prywatne";

type Task = {
  id: string;
  title: string;
  area: Area;
  done: boolean;
  priority: 1 | 2 | 3;
  timing: string;
};

type Habit = {
  id: string;
  label: string;
  detail: string;
  done: boolean;
};

type StoredState = {
  tasks: Task[];
  habits: Habit[];
};

const starterTasks: Task[] = [
  {
    id: "dxcomp-offer",
    title: "Opisz jeden konkretny pakiet usług DxComp",
    area: "DxComp",
    done: false,
    priority: 1,
    timing: "50 min",
  },
  {
    id: "study-plan",
    title: "Sprawdź najbliższe terminy na studiach",
    area: "Studia",
    done: false,
    priority: 2,
    timing: "20 min",
  },
  {
    id: "german-session",
    title: "Zrób krótką sesję niemieckiego",
    area: "Niemiecki",
    done: false,
    priority: 2,
    timing: "25 min",
  },
  {
    id: "weekly-setup",
    title: "Ustal trzy wyniki na ten tydzień",
    area: "Prywatne",
    done: false,
    priority: 3,
    timing: "15 min",
  },
];

const starterHabits: Habit[] = [
  { id: "sleep", label: "Sen", detail: "7,5–8,5 h", done: false },
  { id: "german", label: "Niemiecki", detail: "minimum 20 min", done: false },
  { id: "shutdown", label: "Zamknięcie dnia", detail: "5 min", done: false },
];

const navItems: Array<{ id: View; label: string; icon: string }> = [
  { id: "today", label: "Dzisiaj", icon: "⌂" },
  { id: "tasks", label: "Zadania", icon: "✓" },
  { id: "projects", label: "Projekty", icon: "▦" },
  { id: "dxcomp", label: "DxComp", icon: "↗" },
  { id: "learning", label: "Nauka", icon: "◇" },
  { id: "routines", label: "Rutyny", icon: "↻" },
  { id: "review", label: "Przegląd tygodnia", icon: "◎" },
];

const mobileNav = navItems.filter((item) =>
  ["today", "tasks", "projects", "dxcomp", "review"].includes(item.id),
);

const areaClass: Record<Area, string> = {
  DxComp: "area-dxcomp",
  Studia: "area-studies",
  Niemiecki: "area-german",
  Prywatne: "area-private",
};

function todayInPolish() {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function LifeOS() {
  const [activeView, setActiveView] = useState<View>("today");
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [habits, setHabits] = useState<Habit[]>(starterHabits);
  const [capture, setCapture] = useState("");
  const [captureArea, setCaptureArea] = useState<Area>("DxComp");
  const [taskFilter, setTaskFilter] = useState<Area | "Wszystkie">("Wszystkie");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lifeos-state-v1");
      if (saved) {
        const parsed = JSON.parse(saved) as StoredState;
        if (Array.isArray(parsed.tasks)) setTasks(parsed.tasks);
        if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
      }
    } catch {
      // The starter data remains available if local storage cannot be read.
    }
    setReady(true);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("lifeos-state-v1", JSON.stringify({ tasks, habits }));
  }, [tasks, habits, ready]);

  const openTasks = tasks.filter((task) => !task.done);
  const completedCount = tasks.length - openTasks.length;
  const completion = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const topThree = openTasks.slice(0, 3);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => taskFilter === "Wszystkie" || task.area === taskFilter),
    [taskFilter, tasks],
  );

  function addTask(event: FormEvent) {
    event.preventDefault();
    const title = capture.trim();
    if (!title) return;
    setTasks((current) => [
      ...current,
      {
        id: uid(),
        title,
        area: captureArea,
        done: false,
        priority: 3,
        timing: "do ustalenia",
      },
    ]);
    setCapture("");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    );
  }

  function toggleHabit(id: string) {
    setHabits((current) =>
      current.map((habit) => (habit.id === id ? { ...habit, done: !habit.done } : habit)),
    );
  }

  function navigate(view: View) {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Główna nawigacja">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">L</span>
          <div>
            <strong>LifeOS</strong>
            <span>centrum dowodzenia</span>
          </div>
        </div>

        <nav className="side-nav">
          <p className="nav-label">Twój system</p>
          {navItems.map((item) => (
            <button
              className={activeView === item.id ? "nav-item active" : "nav-item"}
              key={item.id}
              onClick={() => navigate(item.id)}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-quote">
          <span>Reguła systemu</span>
          <p>Najpierw konkretne działanie. Dopiero potem optymalizacja.</p>
        </div>

        <div className="profile">
          <span className="avatar">R</span>
          <div>
            <strong>Twój workspace</strong>
            <span>wersja startowa</span>
          </div>
          <span className="status-dot" title="Dane zapisują się na tym urządzeniu" />
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">{todayInPolish()}</p>
            <h1>{viewTitle(activeView)}</h1>
          </div>
          <div className="topbar-actions">
            <span className="local-badge"><i /> zapis lokalny</span>
            <button className="quiet-button" type="button" onClick={() => navigate("tasks")}>
              + nowe zadanie
            </button>
          </div>
        </header>

        {activeView === "today" && (
          <TodayView
            tasks={tasks}
            topThree={topThree}
            habits={habits}
            completion={completion}
            completedCount={completedCount}
            openTasks={openTasks.length}
            capture={capture}
            captureArea={captureArea}
            setCapture={setCapture}
            setCaptureArea={setCaptureArea}
            addTask={addTask}
            toggleTask={toggleTask}
            toggleHabit={toggleHabit}
            navigate={navigate}
          />
        )}

        {activeView === "tasks" && (
          <TasksView
            tasks={filteredTasks}
            filter={taskFilter}
            capture={capture}
            captureArea={captureArea}
            setFilter={setTaskFilter}
            setCapture={setCapture}
            setCaptureArea={setCaptureArea}
            addTask={addTask}
            toggleTask={toggleTask}
          />
        )}

        {activeView === "projects" && <ProjectsView navigate={navigate} />}
        {activeView === "dxcomp" && <DxCompView />}
        {activeView === "learning" && <LearningView />}
        {activeView === "routines" && (
          <RoutinesView habits={habits} toggleHabit={toggleHabit} />
        )}
        {activeView === "review" && (
          <ReviewView tasks={tasks} completedCount={completedCount} />
        )}
      </main>

      <nav className="mobile-nav" aria-label="Nawigacja mobilna">
        {mobileNav.map((item) => (
          <button
            className={activeView === item.id ? "mobile-nav-item active" : "mobile-nav-item"}
            key={item.id}
            onClick={() => navigate(item.id)}
            type="button"
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.id === "review" ? "Przegląd" : item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function viewTitle(view: View) {
  const titles: Record<View, string> = {
    today: "Dzień dobry. Co dziś dowozimy?",
    tasks: "Zadania i Inbox",
    projects: "Aktywne projekty",
    dxcomp: "Panel rozwoju DxComp",
    learning: "Studia i niemiecki",
    routines: "Rutyny i energia",
    review: "Przegląd tygodnia",
  };
  return titles[view];
}

type TodayProps = {
  tasks: Task[];
  topThree: Task[];
  habits: Habit[];
  completion: number;
  completedCount: number;
  openTasks: number;
  capture: string;
  captureArea: Area;
  setCapture: (value: string) => void;
  setCaptureArea: (value: Area) => void;
  addTask: (event: FormEvent) => void;
  toggleTask: (id: string) => void;
  toggleHabit: (id: string) => void;
  navigate: (view: View) => void;
};

function TodayView(props: TodayProps) {
  const focus = props.topThree[0];

  return (
    <div className="page-stack">
      <form className="quick-capture" onSubmit={props.addTask}>
        <span className="capture-plus" aria-hidden="true">+</span>
        <label className="sr-only" htmlFor="quick-task">Dodaj zadanie do Inboxu</label>
        <input
          id="quick-task"
          value={props.capture}
          onChange={(event) => props.setCapture(event.target.value)}
          placeholder="Zapisz zadanie, pomysł albo rzecz do sprawdzenia…"
        />
        <label className="sr-only" htmlFor="quick-area">Obszar zadania</label>
        <select
          id="quick-area"
          value={props.captureArea}
          onChange={(event) => props.setCaptureArea(event.target.value as Area)}
        >
          <option>DxComp</option>
          <option>Studia</option>
          <option>Niemiecki</option>
          <option>Prywatne</option>
        </select>
        <button type="submit">Dodaj</button>
      </form>

      <section className="dashboard-grid">
        <div className="dashboard-primary">
          <article className="focus-card">
            <div className="focus-topline">
              <span className="focus-label">Główny ruch dnia</span>
              <span className="focus-time">{focus?.timing ?? "gotowe"}</span>
            </div>
            <h2>{focus?.title ?? "Najważniejsze zadania są zamknięte."}</h2>
            <p>
              {focus
                ? "Jedno domknięte działanie jest więcej warte niż dziesięć nowych planów."
                : "Zatrzymaj ten rytm i przygotuj spokojnie kolejny dzień."}
            </p>
            {focus && (
              <button type="button" onClick={() => props.toggleTask(focus.id)}>
                Oznacz jako wykonane <span aria-hidden="true">→</span>
              </button>
            )}
          </article>

          <article className="panel priority-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Plan minimum</span>
                <h2>Trzy priorytety</h2>
              </div>
              <button className="text-button" type="button" onClick={() => props.navigate("tasks")}>
                Wszystkie zadania
              </button>
            </div>
            <div className="priority-list">
              {props.topThree.length ? (
                props.topThree.map((task, index) => (
                  <button
                    className="priority-row"
                    key={task.id}
                    onClick={() => props.toggleTask(task.id)}
                    type="button"
                  >
                    <span className="priority-number">0{index + 1}</span>
                    <span className="task-check" aria-hidden="true" />
                    <span className="priority-copy">
                      <strong>{task.title}</strong>
                      <small><i className={areaClass[task.area]} />{task.area} · {task.timing}</small>
                    </span>
                    <span className="row-arrow" aria-hidden="true">↗</span>
                  </button>
                ))
              ) : (
                <div className="empty-state">Wszystko zrobione. Dodaj następny świadomy krok.</div>
              )}
            </div>
          </article>

          <article className="panel plan-panel">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Rytm dnia</span>
                <h2>Plan energii</h2>
              </div>
            </div>
            <div className="day-plan">
              <div><span>Rano</span><strong>Sprawdź dzień i wybierz wynik</strong><small>3 minuty, bez przebudowywania systemu</small></div>
              <div><span>Praca</span><strong>Wypożyczalnia samochodów</strong><small>Stabilna podstawa finansowa</small></div>
              <div><span>Po pracy</span><strong>Jeden blok wysokiego skupienia</strong><small>DxComp albo studia — nie oba naraz</small></div>
              <div><span>Wieczór</span><strong>Niemiecki i zamknięcie dnia</strong><small>Krótko, regularnie, bez presji perfekcji</small></div>
            </div>
          </article>
        </div>

        <aside className="dashboard-aside">
          <article className="panel score-panel">
            <div className="score-ring" style={{ "--score": `${props.completion * 3.6}deg` } as React.CSSProperties}>
              <div><strong>{props.completion}%</strong><span>dzisiejszego planu</span></div>
            </div>
            <div className="score-stats">
              <div><strong>{props.completedCount}</strong><span>wykonane</span></div>
              <div><strong>{props.openTasks}</strong><span>pozostało</span></div>
            </div>
          </article>

          <article className="panel habits-panel">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">Fundament</span>
                <h2>Dzisiaj dbam o</h2>
              </div>
            </div>
            <div className="habit-list">
              {props.habits.map((habit) => (
                <button
                  className={habit.done ? "habit-row done" : "habit-row"}
                  key={habit.id}
                  onClick={() => props.toggleHabit(habit.id)}
                  type="button"
                >
                  <span className="habit-toggle">{habit.done ? "✓" : ""}</span>
                  <span><strong>{habit.label}</strong><small>{habit.detail}</small></span>
                </button>
              ))}
            </div>
            <button className="full-text-button" type="button" onClick={() => props.navigate("routines")}>
              Otwórz rutyny <span>→</span>
            </button>
          </article>

          <article className="week-card">
            <span className="section-kicker">Kierunek na 90 dni</span>
            <h2>DxComp: od pomysłu do powtarzalnej usługi</h2>
            <div className="milestone"><i /><span><strong>Teraz</strong> sprecyzuj ofertę</span></div>
            <div className="milestone muted"><i /><span><strong>Następnie</strong> zdobądź rozmowy</span></div>
            <div className="milestone muted"><i /><span><strong>Potem</strong> dowieź rezultat</span></div>
            <button type="button" onClick={() => props.navigate("dxcomp")}>Przejdź do panelu DxComp</button>
          </article>
        </aside>
      </section>
    </div>
  );
}

type TasksProps = {
  tasks: Task[];
  filter: Area | "Wszystkie";
  capture: string;
  captureArea: Area;
  setFilter: (value: Area | "Wszystkie") => void;
  setCapture: (value: string) => void;
  setCaptureArea: (value: Area) => void;
  addTask: (event: FormEvent) => void;
  toggleTask: (id: string) => void;
};

function TasksView(props: TasksProps) {
  const filters: Array<Area | "Wszystkie"> = ["Wszystkie", "DxComp", "Studia", "Niemiecki", "Prywatne"];
  return (
    <div className="page-stack">
      <form className="task-composer panel" onSubmit={props.addTask}>
        <div>
          <span className="section-kicker">Szybkie przechwytywanie</span>
          <h2>Co trzeba zrobić?</h2>
        </div>
        <label className="sr-only" htmlFor="task-title">Treść zadania</label>
        <input
          id="task-title"
          value={props.capture}
          onChange={(event) => props.setCapture(event.target.value)}
          placeholder="Np. przygotuj opis usługi dla klienta…"
          autoFocus
        />
        <label className="sr-only" htmlFor="task-area">Obszar</label>
        <select id="task-area" value={props.captureArea} onChange={(event) => props.setCaptureArea(event.target.value as Area)}>
          <option>DxComp</option><option>Studia</option><option>Niemiecki</option><option>Prywatne</option>
        </select>
        <button type="submit">Dodaj do Inboxu</button>
      </form>

      <section className="panel tasks-panel">
        <div className="section-heading tasks-heading">
          <div><span className="section-kicker">Jedna lista</span><h2>Wszystkie zadania</h2></div>
          <div className="filters" aria-label="Filtry zadań">
            {filters.map((filter) => (
              <button className={props.filter === filter ? "active" : ""} key={filter} type="button" onClick={() => props.setFilter(filter)}>{filter}</button>
            ))}
          </div>
        </div>
        <div className="full-task-list">
          {props.tasks.map((task) => (
            <button className={task.done ? "full-task done" : "full-task"} key={task.id} onClick={() => props.toggleTask(task.id)} type="button">
              <span className="task-check">{task.done ? "✓" : ""}</span>
              <span className="priority-copy"><strong>{task.title}</strong><small><i className={areaClass[task.area]} />{task.area} · {task.timing}</small></span>
              <span className={`priority-flag p${task.priority}`}>P{task.priority}</span>
            </button>
          ))}
          {!props.tasks.length && <div className="empty-state">Brak zadań w tym obszarze.</div>}
        </div>
      </section>
    </div>
  );
}

function ProjectsView({ navigate }: { navigate: (view: View) => void }) {
  const projects = [
    { area: "DxComp", title: "Oferta startowa DxComp", outcome: "Jedna jasna usługa, cena i profil klienta", next: "Opisz rezultat dla klienta", color: "orange", action: "dxcomp" as View },
    { area: "Studia", title: "Magisterka IT", outcome: "Terminy pod kontrolą, bez nauki na ostatnią chwilę", next: "Zbierz wszystkie terminy", color: "blue", action: "learning" as View },
    { area: "Niemiecki", title: "Regularny niemiecki", outcome: "5 krótkich sesji w tygodniu", next: "Ustal obecny poziom i materiał", color: "green", action: "learning" as View },
    { area: "System", title: "LifeOS v1", outcome: "Jedno miejsce do świadomego działania", next: "Używaj przez 7 dni i zapisuj tarcia", color: "violet", action: "today" as View },
  ];
  return (
    <div className="projects-grid">
      {projects.map((project) => (
        <article className={`project-card ${project.color}`} key={project.title}>
          <div className="project-top"><span>{project.area}</span><i /></div>
          <h2>{project.title}</h2>
          <p>{project.outcome}</p>
          <div className="next-action"><span>Następne działanie</span><strong>{project.next}</strong></div>
          <button type="button" onClick={() => navigate(project.action)}>Otwórz projekt <span>↗</span></button>
        </article>
      ))}
    </div>
  );
}

function DxCompView() {
  const stages = [
    { label: "Potencjalni", count: 0, note: "lista osób i firm" },
    { label: "Kontakt", count: 0, note: "wysłana wiadomość" },
    { label: "Rozmowa", count: 0, note: "poznany problem" },
    { label: "Oferta", count: 0, note: "konkretna propozycja" },
    { label: "Klient", count: 0, note: "realizacja i rezultat" },
  ];
  return (
    <div className="page-stack">
      <section className="business-hero">
        <div>
          <span className="section-kicker">Cel pierwszego etapu</span>
          <h2>Zamień szeroki pomysł w jedną usługę, którą łatwo wyjaśnić i sprzedać.</h2>
          <p>Najpierw problem klienta, rezultat i zakres. Narzędzia oraz technologia są dopiero później.</p>
        </div>
        <div className="business-formula"><span>Problem</span><i>→</i><span>Usługa</span><i>→</i><span>Rezultat</span></div>
      </section>

      <section className="metric-grid">
        <article><span>Kontakty / tydzień</span><strong>0 <small>/ 10</small></strong><em>cel startowy</em></article>
        <article><span>Rozmowy</span><strong>0 <small>/ 2</small></strong><em>poznanie potrzeb</em></article>
        <article><span>Wysłane oferty</span><strong>0 <small>/ 1</small></strong><em>konkretna propozycja</em></article>
        <article><span>Przychód DxComp</span><strong>0 <small>zł</small></strong><em>punkt startowy</em></article>
      </section>

      <section className="panel pipeline-panel">
        <div className="section-heading"><div><span className="section-kicker">Prosty CRM</span><h2>Lejek klientów</h2></div><button className="quiet-button" type="button">+ dodaj kontakt</button></div>
        <div className="pipeline">
          {stages.map((stage) => (
            <div className="pipeline-column" key={stage.label}>
              <div><strong>{stage.label}</strong><span>{stage.count}</span></div>
              <p>{stage.note}</p>
              <button type="button">Pierwszy wpis +</button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel offer-canvas">
        <div className="section-heading"><div><span className="section-kicker">Do uzupełnienia</span><h2>Karta pierwszej usługi</h2></div></div>
        <div className="canvas-grid">
          <label><span>Dla kogo?</span><textarea placeholder="Konkretny typ klienta…" /></label>
          <label><span>Jaki problem?</span><textarea placeholder="Co dziś kosztuje go czas lub pieniądze?" /></label>
          <label><span>Jaki rezultat?</span><textarea placeholder="Co będzie mierzalnie lepiej?" /></label>
          <label><span>Co dokładnie dostaje?</span><textarea placeholder="Zakres, termin, forma oddania…" /></label>
        </div>
      </section>
    </div>
  );
}

function LearningView() {
  return (
    <div className="learning-grid">
      <article className="learning-card studies-card">
        <span className="learning-symbol">IT</span>
        <span className="section-kicker">Studia magisterskie</span>
        <h2>Najbliższy wynik</h2>
        <p>Zbierz przedmioty, projekty i terminy. Następnie przypisz każdemu tylko jedno następne działanie.</p>
        <div className="learning-empty"><strong>Brak wpisanych terminów</strong><span>Dodaj pierwszy termin, kiedy poznasz plan semestru.</span></div>
        <button type="button">+ dodaj termin</button>
      </article>
      <article className="learning-card german-card">
        <span className="learning-symbol">DE</span>
        <span className="section-kicker">Język niemiecki</span>
        <h2>Regularność przed intensywnością</h2>
        <p>Pięć krótkich sesji tygodniowo. Słownictwo, słuchanie i mówienie w prostym rytmie.</p>
        <div className="week-dots" aria-label="Postęp nauki w tym tygodniu">
          {["P", "W", "Ś", "C", "P", "S", "N"].map((day, index) => <span className={index === 0 ? "today" : ""} key={`${day}-${index}`}>{day}</span>)}
        </div>
        <button type="button">Rozpocznij sesję 20 min</button>
      </article>
    </div>
  );
}

function RoutinesView({ habits, toggleHabit }: { habits: Habit[]; toggleHabit: (id: string) => void }) {
  return (
    <div className="page-stack">
      <section className="routine-intro"><span className="section-kicker">Zasada</span><h2>Rutyny mają chronić energię, a nie tworzyć kolejną listę obowiązków.</h2><p>Na start śledzimy tylko trzy zachowania, które realnie podtrzymują pracę, naukę i biznes.</p></section>
      <section className="routine-grid">
        {habits.map((habit, index) => (
          <button className={habit.done ? "routine-card done" : "routine-card"} key={habit.id} onClick={() => toggleHabit(habit.id)} type="button">
            <span className="routine-index">0{index + 1}</span>
            <span className="habit-toggle">{habit.done ? "✓" : ""}</span>
            <strong>{habit.label}</strong><small>{habit.detail}</small>
            <em>{habit.done ? "wykonane" : "oznacz jako wykonane"}</em>
          </button>
        ))}
      </section>
    </div>
  );
}

function ReviewView({ tasks, completedCount }: { tasks: Task[]; completedCount: number }) {
  return (
    <div className="review-layout">
      <section className="review-score">
        <span className="section-kicker">Pierwszy tydzień</span>
        <strong>{completedCount}<small> / {tasks.length}</small></strong>
        <p>zamkniętych zadań</p>
        <div className="review-note">Nie oceniaj tygodnia po tym, jak był zajęty. Oceń go po rezultatach i odzyskanej jasności.</div>
      </section>
      <section className="panel review-questions">
        <div className="section-heading"><div><span className="section-kicker">45 minut raz w tygodniu</span><h2>Pytania kontrolne</h2></div></div>
        {[
          "Co realnie dowiozłem w tym tygodniu?",
          "Co najbardziej przeszkadzało mi w działaniu?",
          "Jaki jeden ruch najbardziej rozwinie DxComp?",
          "Które terminy studiów wymagają miejsca w kalendarzu?",
          "Co powinienem przestać planować albo śledzić?",
          "Jakie są trzy wyniki następnego tygodnia?",
        ].map((question, index) => (
          <label className="review-question" key={question}><span>0{index + 1}</span><div><strong>{question}</strong><textarea aria-label={question} placeholder="Krótka, konkretna odpowiedź…" /></div></label>
        ))}
        <button className="primary-action" type="button">Zamknij przegląd i wybierz następny tydzień</button>
      </section>
    </div>
  );
}
