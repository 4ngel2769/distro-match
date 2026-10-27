<script>
  import { QUESTIONS_DATA, SURVEY_ROUNDS } from '../data/questions.js';
  import SteeringPanel from './SteeringPanel.svelte';

  let {
    currentIndex = 0,
    userAnswers = {},
    questionWeights = {},
    steering = {},
    onAnswer,
    onWeightChange,
    onSteeringChange,
    onNext,
    onPrev,
    onSkip
  } = $props();

  let showSteeringDrawer = $state(false);

  let currentQuestion = $derived(QUESTIONS_DATA[currentIndex] || QUESTIONS_DATA[0]);
  let currentRound = $derived(SURVEY_ROUNDS.find(r => r.id === currentQuestion.round) || SURVEY_ROUNDS[0]);

  let currentWeight = $derived(
    questionWeights[currentQuestion.id] !== undefined
      ? questionWeights[currentQuestion.id]
      : (currentQuestion.defaultWeight || 1)
  );

  let selectedAnswer = $derived(userAnswers[currentQuestion.id]);
  let progressPercent = $derived(Math.round(((currentIndex + 1) / QUESTIONS_DATA.length) * 100));

  function isOptionSelected(optId) {
    if (currentQuestion.isMultiSelect) {
      return Array.isArray(selectedAnswer) && selectedAnswer.includes(optId);
    }
    return selectedAnswer === optId;
  }

  function handleOptionClick(optId) {
    if (currentQuestion.isMultiSelect) {
      const currentList = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
      const idx = currentList.indexOf(optId);
      if (idx > -1) {
        currentList.splice(idx, 1);
      } else {
        currentList.push(optId);
      }
      onAnswer(currentQuestion.id, currentList);
    } else {
      onAnswer(currentQuestion.id, optId);
    }
  }

  const WEIGHT_OPTIONS = [
    { value: 1, label: 'Normal' },
    { value: 2, label: 'High priority' },
    { value: 3, label: 'Dealbreaker' }
  ];

  function handleWeightSelect(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return;
    onWeightChange(currentQuestion.id, numeric);
  }
</script>

<div class="page-container">
  <!-- Progress Header -->
  <div class="quiz-header">
    <div class="round-status-row">
      <span class="round-title-label">
        {currentRound.title.toUpperCase()}
      </span>
      <span style="font-family: var(--font-label); font-weight: 700;">
        QUESTION {currentIndex + 1} OF {QUESTIONS_DATA.length}
      </span>
    </div>

    <div class="progress-track" aria-hidden="true">
      <div class="progress-fill" style="width: {progressPercent}%;"></div>
    </div>
  </div>

  <!-- Optional Toggle for Steering Panel -->
  <div style="margin-bottom: 16px; display: flex; justify-content: flex-end;">
    <button
      class="btn-secondary"
      style="padding: 4px 10px; font-size: 0.8rem; font-family: var(--font-label);"
      onclick={() => showSteeringDrawer = !showSteeringDrawer}
    >
      {showSteeringDrawer ? '▲ Hide Steering Controls' : '▼ Steer Distro Picker Levers'}
    </button>
  </div>

  {#if showSteeringDrawer}
    <div style="margin-bottom: 20px;">
      <SteeringPanel {steering} {onSteeringChange} />
    </div>
  {/if}

  <!-- Main Question Card -->
  <div class="question-card">
    <div class="question-meta-row">
      <span class="type-pill">
        {currentQuestion.isMultiSelect ? 'MULTIPLE SELECTIONS PERMITTED' : 'SINGLE SELECTION'}
      </span>

      <div class="weight-control">
        <span class="weight-label" id="weight-label">Steering weight</span>
        <div class="weight-segments" role="group" aria-labelledby="weight-label">
          {#each WEIGHT_OPTIONS as option}
            <button
              type="button"
              class="weight-segment"
              class:active={Number(currentWeight) === option.value}
              aria-pressed={Number(currentWeight) === option.value}
              onclick={() => handleWeightSelect(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <h2 class="question-text">{currentQuestion.question}</h2>
    <p class="question-sub">{currentQuestion.subtitle}</p>

    <!-- Context & Technical Explanation Box -->
    <div class="explanation-box">
      <strong>Technical Context:</strong> {currentQuestion.explanation}
    </div>

    <!-- Options List -->
    <div class="options-container">
      {#each currentQuestion.options as opt}
        {@const selected = isOptionSelected(opt.id)}
        <div
          class="option-item {selected ? 'selected' : ''}"
          onclick={() => handleOptionClick(opt.id)}
          onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleOptionClick(opt.id); } }}
          role="button"
          tabindex="0"
          aria-pressed={selected}
        >
          <div class="option-check-square">
            {selected ? '■' : ''}
          </div>
          <div style="flex: 1;">
            <div class="option-label-text">{opt.label}</div>
            <div class="option-desc-text">{opt.description}</div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Navigation Footer -->
    <div class="quiz-footer-nav">
      <div>
        {#if currentIndex > 0}
          <button class="btn-secondary" onclick={onPrev}>
            ← Previous Question
          </button>
        {/if}
      </div>

      <div style="display: flex; gap: 12px; align-items: center;">
        <button class="skip-btn" onclick={onSkip}>
          Skip Question ›
        </button>
        <button class="btn-primary" onclick={onNext}>
          {currentIndex === QUESTIONS_DATA.length - 1 ? 'Calculate Matches ★' : 'Next Question ›'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .quiz-header {
    margin-bottom: 20px;
  }

  .round-status-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-label);
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .progress-track {
    width: 100%;
    height: 8px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
  }

  .progress-fill {
    height: 100%;
    background-color: var(--border-strong);
    transition: width 0.2s ease;
  }

  .question-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    padding: 32px;
    box-shadow: var(--shadow-sharp);
  }

  .question-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 12px;
    margin-bottom: 18px;
  }

  .type-pill {
    font-family: var(--font-label);
    font-size: 0.78rem;
    font-weight: 800;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    padding: 3px 8px;
  }

  .weight-control {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .weight-label {
    font-family: var(--font-label);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-subtle);
  }

  .weight-segments {
    display: inline-flex;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    overflow: hidden;
  }

  .weight-segment {
    background: transparent;
    border: none;
    border-right: 1px solid var(--border-color);
    padding: 6px 12px;
    font-family: var(--font-label);
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--text-muted);
    cursor: pointer;
    transition: background-color 0.12s ease, color 0.12s ease;
    white-space: nowrap;
  }

  .weight-segment:last-child {
    border-right: none;
  }

  .weight-segment:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-main);
  }

  .weight-segment.active {
    background-color: var(--accent-fill);
    color: var(--accent-contrast);
    font-weight: 700;
  }

  .question-text {
    font-size: 1.65rem;
    font-weight: 900;
    line-height: 1.22;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }

  .question-sub {
    font-size: 1rem;
    color: var(--text-muted);
    margin-bottom: 18px;
  }

  .explanation-box {
    background-color: var(--bg-secondary);
    border-left: 3px solid var(--border-strong);
    padding: 10px 14px;
    font-size: 0.88rem;
    color: var(--text-muted);
    margin-bottom: 24px;
    line-height: 1.5;
  }

  .explanation-box strong {
    color: var(--text-main);
  }

  .options-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 28px;
  }

  .option-item {
    border: 1px solid var(--border-color);
    background-color: var(--card-bg);
    padding: 16px 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .option-item:hover {
    background-color: var(--surface-hover);
    border-color: var(--border-strong);
  }

  .option-item.selected {
    background-color: var(--selected-bg);
    border: 2px solid var(--selected-border);
    padding: 15px 19px;
  }

  .option-check-square {
    width: 20px;
    height: 20px;
    border: 2px solid var(--border-strong);
    background-color: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    margin-top: 2px;
    font-weight: 900;
  }

  .option-label-text {
    font-weight: 800;
    font-size: 1.05rem;
    margin-bottom: 4px;
  }

  .option-desc-text {
    font-size: 0.9rem;
    color: var(--text-muted);
    line-height: 1.4;
  }

  .quiz-footer-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    border-top: 1px solid var(--border-color);
    padding-top: 20px;
  }

  .skip-btn {
    background: transparent;
    border: none;
    color: var(--text-subtle);
    font-family: var(--font-label);
    font-size: 0.88rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 6px 12px;
  }

  .skip-btn:hover {
    color: var(--text-main);
    background-color: var(--bg-tertiary);
  }
</style>
