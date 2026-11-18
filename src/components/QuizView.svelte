<script>
  import { QUIZ_STAGES } from '../data/questions.js';
  import Icon from './Icon.svelte';

  let {
    question,
    index = 0,
    total = 0,
    answeredCount = 0,
    stage = null,
    userAnswers = {},
    questionWeights = {},
    onAnswer,
    onWeightChange,
    onPrev,
    onNext,
    onSkip,
    expertMode = false,
    onExpertModeChange
  } = $props();

  const IMPORTANCE = [
    { value: 1, label: 'Nice to have', hint: 'A small tiebreaker.' },
    { value: 2, label: 'Important', hint: 'Weigh this strongly.' },
    { value: 3, label: 'Must-have', hint: 'Filter out mismatches.' }
  ];

  let currentWeight = $derived(
    questionWeights[question.id] ?? question.defaultWeight ?? 2
  );
  let selectedAnswer = $derived(userAnswers[question.id]);
  let progressPercent = $derived(total ? Math.round(((index + 1) / total) * 100) : 0);
  let isMulti = $derived(Boolean(question.isMultiSelect));
  let hasSelection = $derived(
    isMulti ? Array.isArray(selectedAnswer) && selectedAnswer.length > 0 : selectedAnswer != null
  );
  let activeHint = $derived(
    IMPORTANCE.find((level) => level.value === Number(currentWeight))?.hint ?? ''
  );

  function isSelected(optionId) {
    return isMulti
      ? Array.isArray(selectedAnswer) && selectedAnswer.includes(optionId)
      : selectedAnswer === optionId;
  }

  function selectOption(optionId) {
    if (!isMulti) {
      onAnswer(question.id, optionId);
      return;
    }
    const current = Array.isArray(selectedAnswer) ? [...selectedAnswer] : [];
    const at = current.indexOf(optionId);
    if (at >= 0) current.splice(at, 1);
    else current.push(optionId);
    onAnswer(question.id, current);
  }

  function switchMode(next) {
    if (next !== expertMode && typeof onExpertModeChange === 'function') {
      onExpertModeChange();
    }
  }

  function handleKeydown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const active = document.activeElement;
    const tag = active?.tagName;
    // Radios/checkboxes are fine: number shortcuts should still work after
    // changing importance. Only text-entry fields block them.
    const isTextEntry = tag === 'TEXTAREA' || tag === 'SELECT' ||
      (tag === 'INPUT' && !['radio', 'checkbox'].includes(active.type));
    if (isTextEntry) return;
    const n = Number(event.key);
    if (Number.isInteger(n) && n >= 1 && n <= question.options.length) {
      event.preventDefault();
      selectOption(question.options[n - 1].id);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="page-container quiz-page">
  <div class="mode-bar">
    <div class="mode-switch" role="group" aria-label="Questionnaire mode">
      <button
        type="button"
        class:active={!expertMode}
        aria-pressed={!expertMode}
        onclick={() => switchMode(false)}
      >Newcomer</button>
      <button
        type="button"
        class:active={expertMode}
        aria-pressed={expertMode}
        onclick={() => switchMode(true)}
      >Expert</button>
    </div>
    <p class="mode-note">Expert adds kernel and security questions and skips beginner framing.</p>
  </div>

  <div class="quiz-top">
    <div class="stage-rail" aria-label="Questionnaire stages">
      {#each QUIZ_STAGES as item, i}
        <div
          class="stage-step"
          class:current={stage?.id === item.id}
          class:done={stage && item.id < stage.id}
        >
          <span class="stage-index">
            {#if stage && item.id < stage.id}
              <Icon name="check" size={12} />
            {:else}
              {i + 1}
            {/if}
          </span>
          <span class="stage-name">{item.short}</span>
        </div>
      {/each}
    </div>

    <div class="progress-line">
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" style="transform: scaleX({progressPercent / 100})"></div>
      </div>
      <span class="progress-count field-value">Question {index + 1} of {total}</span>
    </div>
  </div>

  <section class="question-card surface">
    <div class="card-top">
      <span class="field-label">Stage {stage?.id} · {stage?.short || 'Question'}</span>
      <span class="field-value select-mode">{isMulti ? 'Select any' : 'Select one'}</span>
    </div>

    <div class="question-heading">
      <h1>{question.question}</h1>
      {#if question.hint}
        <p class="hint">{question.hint}</p>
      {/if}
    </div>

    <div class="options stagger-in" role={isMulti ? 'group' : 'radiogroup'} aria-label={question.question}>
      {#each question.options as option, i}
        {@const selected = isSelected(option.id)}
        <button
          type="button"
          class="option"
          class:selected
          aria-pressed={selected}
          onclick={() => selectOption(option.id)}
        >
          <span class="marker" aria-hidden="true">
            {#if selected}
              <Icon name="check" size={12} />
            {/if}
          </span>
          <span class="option-text">
            <span class="option-label">{option.label}</span>
            <span class="option-detail">{option.detail}</span>
          </span>
          <span class="option-key field-value" aria-hidden="true">{i + 1}</span>
        </button>
      {/each}
    </div>

    <aside class="why-box">
      <span class="why-icon"><Icon name="info" size={14} /></span>
      <span class="why-label field-label">Why we ask</span>
      <span class="why-text">{question.why}</span>
    </aside>

    <fieldset class="importance">
      <legend class="field-label">Importance</legend>
      <div class="importance-options" role="radiogroup" aria-label="How much does this matter?">
        {#each IMPORTANCE as level}
          <label class="importance-choice" class:active={Number(currentWeight) === level.value}>
            <input
              type="radio"
              name="importance-{question.id}"
              value={level.value}
              checked={Number(currentWeight) === level.value}
              onchange={() => onWeightChange(question.id, level.value)}
            />
            <span class="importance-label">{level.label}</span>
          </label>
        {/each}
      </div>
      <p class="importance-hint">{activeHint}</p>
    </fieldset>

    <div class="quiz-actions">
      <div class="left-actions">
        {#if index > 0}
          <button class="btn-secondary" onclick={onPrev}>
            <Icon name="arrow-left" size={14} /> Previous
          </button>
        {/if}
      </div>
      <div class="right-actions">
        <button class="skip-btn" onclick={onSkip}>Skip this question</button>
        <button class="btn-primary" onclick={onNext} disabled={!hasSelection}>
          {index === total - 1 ? 'See my matches' : 'Continue'}
          <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </div>

    <p class="answered-note field-value">
      {answeredCount} of {total} answered · any answer can be changed later
    </p>
  </section>
</div>

<style>
  .quiz-page {
    max-width: 940px;
    margin: 0 auto;
  }

  .mode-bar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-4);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-color);
    margin-bottom: var(--space-5);
  }

  .mode-switch {
    display: inline-flex;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
  }

  .mode-switch button {
    border: 0;
    background: transparent;
    color: var(--text-muted);
    font-family: var(--font-sans);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 7px 14px;
    transition: color var(--dur-1) var(--ease-out), background-color var(--dur-1) var(--ease-out);
  }

  .mode-switch button + button {
    border-left: 1px solid var(--border-color);
  }

  .mode-switch button:hover {
    color: var(--text-main);
  }

  .mode-switch button.active {
    background-color: var(--card-bg);
    color: var(--text-main);
    box-shadow: inset 0 -2px 0 var(--accent-fill);
  }

  .mode-note {
    font-size: 0.78rem;
    color: var(--text-subtle);
    line-height: 1.5;
  }

  .quiz-top {
    margin-bottom: var(--space-5);
  }

  .stage-rail {
    display: flex;
    gap: var(--space-2);
  }

  .stage-step {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    color: var(--text-subtle);
    font-size: 0.78rem;
  }

  .stage-step.current {
    background-color: var(--card-bg);
    color: var(--text-main);
    box-shadow: inset 0 -2px 0 var(--accent-fill);
  }

  .stage-step.done {
    color: var(--text-muted);
  }

  .stage-index {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border: 1px solid currentColor;
    font-family: var(--font-mono);
    font-size: 0.7rem;
  }

  .stage-step.done .stage-index {
    color: var(--accent-color);
  }

  .progress-line {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-3);
  }

  .progress-track {
    flex: 1;
    height: 3px;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    width: 100%;
    height: 100%;
    background-color: var(--accent-fill);
    transform-origin: left center;
    transition: transform var(--dur-2) var(--ease-out);
  }

  .progress-count {
    font-size: 0.72rem;
    color: var(--text-subtle);
    white-space: nowrap;
  }

  .question-card {
    padding: var(--space-6);
  }

  .card-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-3);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-color);
  }

  .select-mode {
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  .question-heading {
    padding-top: var(--space-6);
    margin-bottom: var(--space-5);
  }

  .question-heading h1 {
    font-size: clamp(1.5rem, 3vw, 1.95rem);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.015em;
    max-width: 34ch;
  }

  .hint {
    margin-top: var(--space-2);
    font-size: 0.94rem;
    color: var(--text-muted);
    max-width: 68ch;
    line-height: 1.55;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .option {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    text-align: left;
    padding: var(--space-4);
    background-color: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    transition: background-color var(--dur-1) var(--ease-out),
      border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out);
  }

  .option:hover {
    border-color: var(--border-strong);
    background-color: var(--surface-hover);
  }

  .option.selected {
    border-color: var(--accent-color);
    background-color: var(--accent-wash);
    box-shadow: inset 3px 0 0 var(--accent-fill);
  }

  .marker {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border: 1px solid var(--border-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    margin-top: 2px;
  }

  .option.selected .marker {
    border-color: var(--accent-color);
  }

  .option-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 0;
  }

  .option-label {
    font-size: 0.98rem;
    font-weight: 600;
    line-height: 1.35;
  }

  .option-detail {
    font-size: 0.84rem;
    color: var(--text-muted);
    line-height: 1.5;
    max-width: 68ch;
  }

  .option-key {
    font-size: 0.7rem;
    color: var(--text-subtle);
    border: 1px solid var(--border-color);
    padding: 1px 6px;
    flex-shrink: 0;
  }

  .why-box {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    margin-top: var(--space-5);
    padding: var(--space-3) var(--space-4);
    background-color: var(--bg-secondary);
    border-top: 1px solid var(--border-color);
    font-size: 0.86rem;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .why-icon {
    display: inline-flex;
    align-items: center;
    color: var(--accent-color);
  }

  .why-label {
    white-space: nowrap;
  }

  .importance {
    border: 0;
    border-top: 1px solid var(--border-color);
    margin: var(--space-5) 0 0;
    padding: var(--space-5) 0 0;
    min-width: 0;
  }

  .importance legend {
    padding: 0 var(--space-2) 0 0;
    margin-bottom: var(--space-3);
  }

  .importance-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    border: 1px solid var(--border-color);
  }

  .importance-choice {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px 12px;
    background-color: var(--card-bg);
    cursor: pointer;
    text-align: center;
    transition: background-color var(--dur-1) var(--ease-out);
  }

  .importance-choice + .importance-choice {
    border-left: 1px solid var(--border-color);
  }

  .importance-choice:hover {
    background-color: var(--surface-hover);
  }

  .importance-choice.active {
    background-color: var(--accent-wash);
    box-shadow: inset 0 -2px 0 var(--accent-fill);
  }

  .importance-choice:focus-within {
    outline: 2px solid var(--accent-color);
    outline-offset: 1px;
  }

  .importance-choice input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .importance-label {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-muted);
  }

  .importance-choice.active .importance-label {
    color: var(--text-main);
  }

  .importance-hint {
    margin-top: var(--space-2);
    font-size: 0.75rem;
    color: var(--text-subtle);
  }

  .quiz-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
    margin-top: var(--space-5);
    padding-top: var(--space-5);
  }

  .left-actions,
  .right-actions {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .skip-btn {
    background: transparent;
    border: 0;
    color: var(--text-subtle);
    font-size: 0.84rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    padding: 6px 4px;
    transition: color var(--dur-1) var(--ease-out);
  }

  .skip-btn:hover {
    color: var(--text-main);
  }

  .btn-primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }

  .answered-note {
    margin-top: var(--space-4);
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  @media (max-width: 720px) {
    .question-card {
      padding: var(--space-5);
    }

    .question-heading {
      padding-top: var(--space-5);
    }

    .question-heading h1 {
      font-size: 1.4rem;
    }

    .stage-name {
      display: none;
    }

    .stage-step {
      justify-content: center;
    }

    .importance-options {
      grid-template-columns: 1fr;
    }

    .importance-choice + .importance-choice {
      border-left: 0;
      border-top: 1px solid var(--border-color);
    }

    .option-key {
      display: none;
    }

    .why-box {
      flex-wrap: wrap;
      gap: var(--space-1) var(--space-2);
    }
  }
</style>
