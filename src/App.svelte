<script>
  import { onMount } from 'svelte';
  import Navbar from './components/Navbar.svelte';
  import SiteFooter from './components/SiteFooter.svelte';
  import WelcomeView from './components/WelcomeView.svelte';
  import QuizView from './components/QuizView.svelte';
  import IntermissionView from './components/IntermissionView.svelte';
  import ResultsView from './components/ResultsView.svelte';
  import DirectoryView from './components/DirectoryView.svelte';
  import ComparisonView from './components/ComparisonView.svelte';
  import PrivacyView from './components/PrivacyView.svelte';
  import TermsView from './components/TermsView.svelte';
  import DistroDetailPage from './components/DistroDetailPage.svelte';
  import LandingView from './components/LandingView.svelte';
  import { QUIZ_STAGES, visibleQuestions } from './data/questions.js';
  import { LINUX_DISTROS, DISTRO_MAP } from './data/distros.js';
  import { parseRoute, routePath, routeTitle, comparePath } from './lib/router.js';
  import { landingPageFor } from './data/landingPages.js';

  const initialRoute = parseRoute(window.location.pathname);
  let route = $state(initialRoute);
  let currentTheme = $state('light');
  let topLoaderWidth = $state(0);
  let topLoaderOpacity = $state(0);
  let intermissionOpen = $state(false);

  // Quiz state
  let currentQuestionIndex = $state(0);
  let userAnswers = $state({});
  let questionWeights = $state({});
  let questionHistory = $state([]);
  let completedStage = $state(null);
  let nextStage = $state(null);
  let intermissionIsFinal = $state(false);

  // Only questions relevant to the current answers are asked. The NVIDIA
  // driver question, for example, disappears if another GPU is selected.
  let quizQuestions = $derived(visibleQuestions(userAnswers, { expert: Boolean(steering.expertMode) }));
  let currentQuestion = $derived(quizQuestions[currentQuestionIndex] || null);
  let currentStage = $derived(
    currentQuestion ? QUIZ_STAGES.find((s) => s.id === currentQuestion.stage) || QUIZ_STAGES[0] : QUIZ_STAGES[0]
  );
  let answeredCount = $derived(
    quizQuestions.filter((q) => {
      const value = userAnswers[q.id];
      return Array.isArray(value) ? value.length > 0 : value != null && value !== '';
    }).length
  );

  // Active Real-Time User Steering Controls
  let steering = $state({
    scope: 'mainstream', // 'mainstream' (Flagships + Specialists) vs 'all' (Includes Niche)
    familyBias: 'all',
    gamingBoost: false,
    stabilityBias: 'any',
    nvidiaBoost: false,
    snapsPreference: 'neutral',
    expertMode: false
  });

  // Comparison tool initial inputs (the URL is the source of truth when present)
  let compareDistroA = $state(initialRoute.compareIds?.[0] || 'linux-mint');
  let compareDistroB = $state(initialRoute.compareIds?.[1] || 'arch-linux');

  let activeView = $derived(route.view);
  let activeDistro = $derived(
    route.distroId ? LINUX_DISTROS.find((d) => d.id === route.distroId) || null : null
  );
  let navView = $derived(
    route.view === 'distro' || route.view === 'landing'
      ? 'directory'
      : route.view === 'intermission'
        ? 'quiz'
        : route.view
  );
  let hasAnswers = $derived(
    Object.values(userAnswers).some((value) =>
      Array.isArray(value) ? value.length > 0 : value != null && value !== ''
    )
  );

  onMount(() => {
    const savedTheme = localStorage.getItem('distromatch_theme') || 'light';
    setTheme(savedTheme);

    applyLocation({ initial: true });
    window.addEventListener('popstate', () => applyLocation({ initial: true }));
  });

  function setTheme(t) {
    currentTheme = t;
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('distromatch_theme', t);
  }

  function toggleTheme() {
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  // Trigger Snappy Thin Top Loading Bar
  function triggerTopLoader() {
    topLoaderWidth = 20;
    topLoaderOpacity = 1;
    setTimeout(() => {
      topLoaderWidth = 75;
    }, 60);
    setTimeout(() => {
      topLoaderWidth = 100;
      setTimeout(() => {
        topLoaderOpacity = 0;
        setTimeout(() => {
          topLoaderWidth = 0;
        }, 200);
      }, 150);
    }, 180);
  }

  /** Sync app state with the current URL. */
  function applyLocation({ initial = false, preserveScroll = false } = {}) {
    const parsed = parseRoute(window.location.pathname);

    // Never show a results page without answers — send people to the quiz.
    if (parsed.view === 'results' && !hasAnswers) {
      const path = routePath('welcome');
      window.history.replaceState({}, '', path);
      route = { view: 'welcome', distroId: null, compareIds: null, path };
      document.title = routeTitle('welcome');
      if (!initial) window.scrollTo({ top: 0 });
      return;
    }

    if (parsed.view === 'compare') {
      const ids = parsed.compareIds || [];
      const valid =
        ids.length === 2 &&
        ids[0] !== ids[1] &&
        DISTRO_MAP[ids[0]] &&
        DISTRO_MAP[ids[1]];
      if (valid) {
        compareDistroA = ids[0];
        compareDistroB = ids[1];
        const canonical = comparePath(ids[0], ids[1]);
        if (window.location.pathname !== canonical) {
          window.history.replaceState({}, '', canonical);
        }
        parsed.path = canonical;
      } else {
        const fallbackA = DISTRO_MAP[ids[0]]
          ? ids[0]
          : DISTRO_MAP[compareDistroA]
            ? compareDistroA
            : 'linux-mint';
        const fallbackB =
          DISTRO_MAP[ids[1]] && ids[1] !== fallbackA
            ? ids[1]
            : DISTRO_MAP[compareDistroB] && compareDistroB !== fallbackA
              ? compareDistroB
              : fallbackA === 'linux-mint'
                ? 'arch-linux'
                : 'linux-mint';
        compareDistroA = fallbackA;
        compareDistroB = fallbackB;
        const canonical = comparePath(fallbackA, fallbackB);
        if (window.location.pathname !== canonical) {
          window.history.replaceState({}, '', canonical);
        }
        parsed.path = canonical;
      }
    }

    route = parsed;
    intermissionOpen = false;
    document.title =
      parsed.view === 'compare'
        ? `${distroFor(compareDistroA)?.name} vs ${distroFor(compareDistroB)?.name} — Linux Distribution Comparison | LinuxMatch`
        : parsed.view === 'landing'
          ? landingTitleFor(parsed)
          : routeTitle(parsed.view, distroFor(parsed.distroId));
    if (!preserveScroll) window.scrollTo({ top: 0 });
  }

  /** Keyword landing pages carry their own SEO title. */
  function landingTitleFor(parsed) {
    const landing = landingPageFor(parsed.path);
    return landing ? landing.page.title : routeTitle('landing');
  }

  function distroFor(id) {
    return id ? LINUX_DISTROS.find((d) => d.id === id) || null : null;
  }

  /**
   * Navigate to a top-level view or a distro profile.
   * Pushes a real history entry so the browser back button behaves.
   */
  function navigateTo(view, distroId = null, { replace = false } = {}) {
    if (view === 'compare') {
      navigateToCompare(compareDistroA, compareDistroB, { replace });
      return;
    }

    const path = routePath(view === 'distro' ? 'distro' : view, distroId);
    if (window.location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    triggerTopLoader();
    if (replace) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    applyLocation();
  }

  /** Keep the shareable comparison URL in sync with the two selections. */
  function navigateToCompare(
    distroIdA,
    distroIdB,
    { replace = false, preserveScroll = false, showLoader = true } = {}
  ) {
    const a = DISTRO_MAP[distroIdA] ? distroIdA : 'linux-mint';
    let b = DISTRO_MAP[distroIdB] ? distroIdB : 'arch-linux';
    if (b === a) b = a === 'linux-mint' ? 'arch-linux' : 'linux-mint';
    compareDistroA = a;
    compareDistroB = b;
    const path = comparePath(a, b);
    if (window.location.pathname === path) return;

    if (showLoader) triggerTopLoader();
    if (replace) window.history.replaceState({}, '', path);
    else window.history.pushState({}, '', path);
    applyLocation({ preserveScroll });
  }

  function handleCompareChange(distroIdA, distroIdB) {
    // Filter-like state: update the current history entry instead of stacking
    // one entry per selection, and keep the user's scrolling position.
    navigateToCompare(distroIdA, distroIdB, {
      replace: true,
      preserveScroll: true,
      showLoader: false
    });
  }

  function openDistro(distroId) {
    intermissionOpen = false;
    navigateTo('distro', distroId);
  }

  function handleStartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = {};
    questionWeights = {};
    questionHistory = [];
    completedStage = null;
    nextStage = null;
    intermissionIsFinal = false;
    intermissionOpen = false;
    navigateTo('quiz');
  }

  function handleAnswer(questionId, value) {
    const nextAnswers = { ...userAnswers, [questionId]: value };
    // Drop answers to questions that the new answer makes irrelevant.
    for (const question of visibleQuestions(nextAnswers)) {
      if (question.when && !question.when(nextAnswers)) delete nextAnswers[question.id];
    }
    userAnswers = nextAnswers;
  }

  function handleWeightChange(questionId, weight) {
    questionWeights = { ...questionWeights, [questionId]: weight };
  }

  function handleSteeringChange(newSteering) {
    steering = newSteering;
  }

  /** Switch between newcomer and expert paths without losing the current question. */
  function handleExpertModeChange() {
    const currentId = currentQuestion?.id;
    const next = { ...steering, expertMode: !steering.expertMode };
    steering = next;
    const list = visibleQuestions(userAnswers, { expert: next.expertMode });
    const idx = list.findIndex((q) => q.id === currentId);
    currentQuestionIndex = idx >= 0 ? idx : Math.min(currentQuestionIndex, Math.max(0, list.length - 1));
    questionHistory = [];
    intermissionOpen = false;
  }

  function finishQuiz() {
    intermissionOpen = false;
    navigateTo('results');
  }

  function showStageBreak(final = false, stage = currentStage) {
    completedStage = stage;
    nextStage = final ? null : QUIZ_STAGES.find((s) => s.id === stage.id + 1) || null;
    intermissionIsFinal = final;
    triggerTopLoader();
    intermissionOpen = true;
    window.scrollTo({ top: 0 });
  }

  function handleNextQuestion() {
    const currentQ = currentQuestion;
    if (!currentQ) return;
    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx >= quizQuestions.length) {
      showStageBreak(true, currentStage);
      return;
    }

    const nextQ = quizQuestions[nextIdx];
    // Capture the stage before advancing: currentStage is derived from the
    // question at currentQuestionIndex.
    const completed = QUIZ_STAGES.find((s) => s.id === currentQ.stage) || currentStage;
    questionHistory = [...questionHistory, currentQuestionIndex];
    currentQuestionIndex = nextIdx;

    if (nextQ.stage !== currentQ.stage) showStageBreak(false, completed);
    else window.scrollTo({ top: 0 });
  }

  function handlePrevQuestion() {
    if (intermissionOpen) {
      // A stage break sits *after* the last question of a stage, so stepping
      // back lands on that question. The final break sits on the last question
      // itself, so we stay put and let them change it.
      intermissionOpen = false;
      if (!intermissionIsFinal) {
        currentQuestionIndex = Math.max(0, currentQuestionIndex - 1);
        questionHistory = questionHistory.slice(0, -1);
      }
      if (route.view !== 'quiz') navigateTo('quiz');
      else window.scrollTo({ top: 0 });
      return;
    }
    if (questionHistory.length > 0) {
      const prevIdx = questionHistory[questionHistory.length - 1];
      questionHistory = questionHistory.slice(0, -1);
      currentQuestionIndex = prevIdx;
      if (route.view !== 'quiz') {
        navigateTo('quiz');
      } else {
        window.scrollTo({ top: 0 });
      }
    }
  }

  function handleSkipQuestion() {
    if (!currentQuestion) return;
    const updated = { ...userAnswers };
    delete updated[currentQuestion.id];
    userAnswers = updated;
    handleNextQuestion();
  }

  function handleContinueFromIntermission() {
    if (intermissionIsFinal) {
      finishQuiz();
      return;
    }
    triggerTopLoader();
    intermissionOpen = false;
    window.scrollTo({ top: 0 });
  }

  function handleSelectForCompare(distroId) {
    if (distroId === compareDistroA) {
      compareDistroA = compareDistroB;
    }
    compareDistroB = distroId;
    navigateToCompare(compareDistroA, compareDistroB);
  }
</script>

<!-- Thin Top Loading Progress Bar -->
<div
  class="top-loading-bar"
  style="width: {topLoaderWidth}%; opacity: {topLoaderOpacity};"
></div>

<!-- Site Navigation -->
<Navbar
  activeView={navView}
  {currentTheme}
  onNavigate={navigateTo}
  onToggleTheme={toggleTheme}
/>

<!-- Main Dynamic Content Wrapper -->
<main class="main-wrapper">
  {#if activeView === 'welcome'}
    <WelcomeView
      onStartQuiz={handleStartQuiz}
      onNavigate={navigateTo}
      {steering}
      expertMode={Boolean(steering.expertMode)}
      onExpertModeChange={handleExpertModeChange}
      onSteeringChange={handleSteeringChange}
    />
  {:else if activeView === 'quiz'}
    {#if intermissionOpen}
      <IntermissionView
        stage={completedStage}
        {nextStage}
        isFinal={intermissionIsFinal}
        {userAnswers}
        {questionWeights}
        {steering}
        onContinue={handleContinueFromIntermission}
        onBack={handlePrevQuestion}
      />
    {:else if currentQuestion}
      <QuizView
        question={currentQuestion}
        index={currentQuestionIndex}
        total={quizQuestions.length}
        answeredCount={answeredCount}
        stage={currentStage}
        expertMode={Boolean(steering.expertMode)}
        onExpertModeChange={handleExpertModeChange}
        {userAnswers}
        {questionWeights}
        onAnswer={handleAnswer}
        onWeightChange={handleWeightChange}
        onNext={handleNextQuestion}
        onPrev={handlePrevQuestion}
        onSkip={handleSkipQuestion}
      />
    {:else}
      <div class="page-container">
        <div class="not-found-card">
          <h1>No questions left to answer</h1>
          <p>Restart the finder to build a fresh shortlist.</p>
          <button class="btn-primary" onclick={handleStartQuiz}>Start again</button>
        </div>
      </div>
    {/if}
  {:else if activeView === 'results'}
    <ResultsView
      {userAnswers}
      {questionWeights}
      {steering}
      onSteeringChange={handleSteeringChange}
      onRetake={handleStartQuiz}
      onCompareWith={handleSelectForCompare}
      onOpenDistro={openDistro}
    />
  {:else if activeView === 'directory'}
    <DirectoryView
      onSelectForCompare={handleSelectForCompare}
      onOpenDistro={openDistro}
    />
  {:else if activeView === 'distro'}
    <DistroDetailPage
      distro={activeDistro}
      onBack={() => navigateTo('directory')}
      onNavigateDistro={openDistro}
      onCompareWith={handleSelectForCompare}
    />
  {:else if activeView === 'compare'}
    <ComparisonView
      initialDistroA={compareDistroA}
      initialDistroB={compareDistroB}
      onCompareChange={handleCompareChange}
    />
  {:else if activeView === 'landing'}
    <LandingView kind={route.landingKind} slug={route.landingSlug} />
  {:else if activeView === 'privacy'}
    <PrivacyView />
  {:else if activeView === 'terms'}
    <TermsView />
  {:else}
    <div class="page-container">
      <div class="not-found-card">
        <div class="eyebrow">404 — PAGE NOT FOUND</div>
        <h1>Nothing lives at this address</h1>
        <p>The link may be outdated. Try the directory or retake the finder quiz.</p>
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <button class="btn-primary" onclick={() => navigateTo('directory')}>Browse the directory</button>
          <button class="btn-secondary" onclick={() => navigateTo('welcome')}>Back home</button>
        </div>
      </div>
    </div>
  {/if}
</main>

<!-- Footer -->
<SiteFooter onNavigate={navigateTo} distroCount={LINUX_DISTROS.length} />

<style>
  .not-found-card {
    border: 2px solid var(--border-strong);
    box-shadow: var(--shadow-sharp);
    background-color: var(--card-bg);
    padding: 40px;
  }

  .eyebrow {
    font-family: var(--font-label);
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--accent-red);
    margin-bottom: 8px;
  }

  .not-found-card h1 {
    font-size: 2rem;
    margin-bottom: 8px;
  }

  .not-found-card p {
    color: var(--text-muted);
    margin-bottom: 20px;
  }
</style>
