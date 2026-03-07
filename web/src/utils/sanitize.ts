export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  sanitized = sanitized.replace(/\s*on\w+\s*=\s*(?:["'][^"']*["']|[^\s>]*)/gi, '');

  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/href\s*=\s*["']data:(?!image\/)[^"']*["']/gi, '');

  const dangerousTags = [
    'script', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet',
    'form', 'input', 'button', 'textarea', 'select', 'option',
    'meta', 'link', 'style', 'head', 'html', 'body'
  ];

  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<\\/?${tag}\\b[^>]*>`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });

  return sanitized.trim();
}

export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .trim();
}

export function sanitizeTextForDisplay(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/[<>&"']/g, (match) => {
      switch (match) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        default: return match;
      }
    });
}

export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim().toLowerCase();

  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:') ||
    (trimmed.startsWith('data:') && !trimmed.startsWith('data:image/')) ||
    trimmed.includes('<script') ||
    trimmed.includes('javascript:')
  ) {
    return null;
  }

  // Allow http, https, and relative URLs
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  const relativePattern = /^[\/\.]?[\/\w\.-]*$/;

  if (!urlPattern.test(trimmed) && !relativePattern.test(trimmed)) {
    return null;
  }

  return url.trim();
}

export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';

  return query
    .replace(/[<>&"'%\x00-\x1f\x7f-\x9f]/g, '')
    .replace(/[^\w\s\-._@áàâãéêíóôõúçñü]/gi, '')
    .trim()
    .slice(0, 100);
}

export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') return null;

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) return null;

  return trimmed;
}

export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'unnamed_file';

  return filename
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\.\./g, '')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 255) || 'unnamed_file';
}

export function sanitizeId(id: unknown): number | null {
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return id;
  }

  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

export function sanitizeJsonString(input: string): string {
  if (!input || typeof input !== 'string') return '{}';

  try {
    const parsed = JSON.parse(input);

    const sanitized = JSON.stringify(parsed, (_key, value) => {
      if (typeof value === 'function' || typeof value === 'undefined') {
        return null;
      }
      if (typeof value === 'string') {
        return sanitizeText(value);
      }
      return value;
    });

    return sanitized;
  } catch {
    return '{}';
  }
}
