/**
 * Return text without highlighting.
 * Previously highlighted matching text, now returns plain text.
 */
export const highlightText = (text, query) => {
  if (!text) return text;
  return String(text);
};

