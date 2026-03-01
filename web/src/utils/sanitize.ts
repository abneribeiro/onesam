/**
 * Text sanitization utilities - re-exported from API
 * This ensures consistency across frontend and backend
 */

export {
  sanitizeHtml,
  stripHtml,
  sanitizeText,
  sanitizeTextForDisplay,
  sanitizeUrl,
  sanitizeSearchQuery,
  sanitizeEmail,
  sanitizeFilename,
  sanitizeId,
  sanitizeJsonString
} from '../../../api/src/utils/sanitize';