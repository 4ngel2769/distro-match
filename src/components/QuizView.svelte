<script>
  import { QUIZ_STAGES } from '../data/questions.js';

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
    onSkip
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
  <!-- Stage + progress rail -->
  <div class="quiz-top">
    <div class="stage-rail" aria-label="Questionnaire stages">
      {#each QUIZ_STAGES as item, i}
        <div
          class="stage-step"
          class:current={stage?.id === item.id}
          class:done={stage && item.id < stage.id}
        >
          <span class="stage-index">{stage && item.id < stage.id ? '✓' : i + 1}</span>
          <span class="stage-name">{item.short}</span>
        </div>
      {/each}
    </div>

    <div class="progress-line">
      <div class="progress-track" aria-hidden="true">
        <div class="progress-fill" style="width: {progressPercent}%"></div>
      </div>
      <span class="progress-count">Question {index + 1} of {total}</span>
    </div>
  </div>

  <section class="question-card">
    <div class="question-heading">
      <div class="eyebrow">
        {stage?.title || 'Question'} · {isMulti ? 'select any that apply' : 'select one'}
      </div>
      <h1>{question.question}</h1>
      <p class="hint">{question.hint}</p>
    </div>

    <div class="options" role={isMulti ? 'group' : 'radiogroup'} aria-label={question.question}>
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
            {isMulti ? (selected ? '✓' : '') : (selected ? '●' : '')}
          </span>
          <span class="option-text">
            <span class="option-label">{option.label}</span>
            <span class="option-detail">{option.detail}</span>
          </span>
          <span class="option-key" aria-hidden="true">{i + 1}</span>
        </button>
      {/each}
    </div>

    <aside class="why-box">
      <span class="why-label">Why we ask</span>
      <span>{question.why}</span>
    </aside>

    <fieldset class="importance">
      <legend>How much does this matter?</legend>
      <div class="importance-options">
        {#each IMPORTANCE as level}
          <label class="importance-choice" class:active={Number(currentWeight) === level.value}>
            <input
              type="radio"
              name="importance-{question.id}"
              value={level.value}
              checked={Number(currentWeight) === level.value}
              onchange={() => onWeightChange(question.id, level.value)}
            />
            <span class="importance-dot" aria-hidden="true"></span>
            <span class="importance-copy">
              <strong>{level.label}</strong>
              <small>{level.hint}</small>
            </span>
          </label>
        {/each}
      </div>
    </fieldset>

    <div class="quiz-actions">
      <div class="left-actions">
        {#if index > 0}
          <button class="btn-secondary" onclick={onPrev}>← Previous</button>
        {/if}
      </div>
      <div class="right-actions">
        <button class="skip-btn" onclick={onSkip}>Skip this question</button>
        <button class="btn-primary" onclick={onNext} disabled={!hasSelection}>
          {index === total - 1 ? 'See my matches' : 'Continue →'}
        </button>
      </div>
    </div>

    <div class="answered-note">
      {answeredCount} of {total} answered so far · you can change any answer later
    </div>
  </section>
</div>

<style>
  .quiz-page {
    max-width: 880px;
    margin: 0 auto;
  }

  .quiz-top {
    margin-bottom: 20px;
  }

  .stage-rail {
    display: flex;
    gap: 8px;
    margin-bottom: 14px;
  }

  .stage-step {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-secondary);
    color: var(--text-subtle);
    font-family: var(--font-label);
    font-size: 0.8rem;
  }

  .stage-step.current {
    border-color: var(--accent-color);
    color: var(--text-main);
    background-color: var(--accent-wash);
  }

  .stage-step.done {
    color: var(--text-muted);
  }

  .stage-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border: 1px solid currentColor;
    font-weight: 800;
    font-size: 0.72rem;
  }

  .stage-step.current .stage-index {
    background-color: var(--accent-fill);
    border-color: var(--accent-fill);
    color: var(--accent-contrast);
  }

  .progress-line {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .progress-track {
    flex: 1;
    height: 6px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-color);
  }

  .progress-fill {
    height: 100%;
    background-color: var(--accent-fill);
    transition: width 0.2s ease;
  }

  .progress-count {
    font-family: var(--font-label);
    font-size: 0.76rem;
    color: var(--text-subtle);
    white-space: nowrap;
  }

  .question-card {
    border: 2px solid var(--border-strong);
    background-color: var(--card-bg);
    box-shadow: var(--shadow-sharp);
    padding: 30px;
  }

  .question-heading {
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 18px;
    margin-bottom: 20px;
  }

  .eyebrow {
    font-family: var(--font-label);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--accent-color);
    margin-bottom: 10px;
  }

  .question-heading h1 {
    font-size: 1.75rem;
    font-weight: 900;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  .hint {
    margin-top: 8px;
    font-size: 0.94rem;
    color: var(--text-muted);
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .option {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    text-align: left;
    padding: 14px 16px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    cursor: pointer;
    transition: border-color 0.1s ease, background-color 0.1s ease;
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
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border: 2px solid var(--border-color);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--accent-color);
    margin-top: 1px;
  }

  .option.selected .marker {
    border-color: var(--accent-color);
  }

  .option-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1;
    min-width: 0;
  }

  .option-label {
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
  }

  .option-detail {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.45;
  }

  .option-key {
    font-family: var(--font-label);
    font-size: 0.7rem;
    color: var(--text-subtle);
    border: 1px solid var(--border-color);
    padding: 1px 6px;
    flex-shrink: 0;
  }

  .why-box {
    display: flex;
    gap: 10px;
    align-items: baseline;
    margin-top: 18px;
    padding: 12px 14px;
    background-color: var(--bg-secondary);
    border-left: 3px solid var(--accent-color);
    font-size: 0.86rem;
    color: var(--text-muted);
    line-height: 1.5;
  }

  .why-label {
    font-family: var(--font-label);
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-subtle);
    white-space: nowrap;
  }

  .importance {
    border: 1px solid var(--border-color);
    padding: 14px 16px 16px;
    margin: 22px 0 0;
  }

  .importance legend {
    font-family: var(--font-label);
    font-size: 0.76rem;
    font-weight: 700;
    color: var(--text-subtle);
    padding: 0 6px;
  }

  .importance-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .importance-choice {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 9px;
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    background-color: var(--bg-primary);
    cursor: pointer;
    transition: border-color 0.1s ease, background-color 0.1s ease;
  }

  .importance-choice:hover {
    border-color: var(--border-strong);
  }

  .importance-choice.active {
    border-color: var(--accent-color);
    background-color: var(--accent-wash);
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

  .importance-dot {
    width: 14px;
    height: 14px;
    margin-top: 2px;
    border: 2px solid var(--border-color);
    flex-shrink: 0;
  }

  .importance-choice.active .importance-dot {
    border-color: var(--accent-color);
    background-color: var(--accent-fill);
    box-shadow: inset 0 0 0 2px var(--bg-primary);
  }

  .importance-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .importance-copy strong {
    font-size: 0.84rem;
    font-weight: 700;
  }

  .importance-copy small {
    font-size: 0.72rem;
    color: var(--text-subtle);
    line-height: 1.35;
  }

  .quiz-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    border-top: 1px solid var(--border-color);
    margin-top: 24px;
    padding-top: 18px;
  }

  .left-actions,
  .right-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .skip-btn {
    background: transparent;
    border: none;
    color: var(--text-subtle);
    font-family: var(--font-label);
    font-size: 0.84rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    cursor: pointer;
    padding: 6px 4px;
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
    margin-top: 14px;
    font-family: var(--font-label);
    font-size: 0.72rem;
    color: var(--text-subtle);
  }

  @media (max-width: 720px) {
    .question-card {
      padding: 20px;
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

    .option-key {
      display: none;
    }

    .why-box {
      flex-direction: column;
      gap: 4px;
    }
  }
</style>
