import { useEffect } from 'react';

/**
 * Update document.title + the `<meta name="description">` tag from a page.
 * Falls back gracefully if no description is provided or the meta tag is
 * missing.
 */
export default function useDocumentTitle(title, description) {
  useEffect(() => {
    if (title) {
      const previous = document.title;
      document.title = title;
      return () => {
        document.title = previous;
      };
    }
    return undefined;
  }, [title]);

  useEffect(() => {
    if (!description) return undefined;
    const tag = document.querySelector('meta[name="description"]');
    if (!tag) return undefined;
    const previous = tag.getAttribute('content') || '';
    tag.setAttribute('content', description);
    return () => {
      tag.setAttribute('content', previous);
    };
  }, [description]);
}
