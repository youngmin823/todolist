export const PRIORITY_SCALE = [
  { value: 1, label: '매우 높음' },
  { value: 2, label: '높음' },
  { value: 3, label: '중간' },
  { value: 4, label: '낮음' },
  { value: 5, label: '매우 낮음' }
];

export const DEFAULT_PRIORITY = 3;

export const normalizePriority = (value, fallback = DEFAULT_PRIORITY) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  if (numeric < 1) {
    return 1;
  }
  if (numeric > 5) {
    return 5;
  }
  return Math.round(numeric);
};

export const getPriorityLabel = (value) => {
  const normalized = normalizePriority(value);
  const matched = PRIORITY_SCALE.find((option) => option.value === normalized);
  return matched ? matched.label : PRIORITY_SCALE.find((option) => option.value === DEFAULT_PRIORITY).label;
};
