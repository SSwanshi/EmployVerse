/**
 * Highlight all case-insensitive occurrences of `query` within `text`
 * using the project's yellow theme.
 */
export const highlightText = (text, query) => {
  if (!text || !query) return text;

  const safeText = String(text);
  const safeQuery = String(query).trim();
  if (!safeQuery) return safeText;

  // Escape special regex characters in the query
  const escaped = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  const parts = safeText.split(regex);

  return parts.map((part, index) =>
    part.toLowerCase() === safeQuery.toLowerCase() ? (
      <span key={index} className="bg-yellow-200 px-0.5 rounded">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

