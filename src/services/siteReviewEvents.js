export const SITE_REVIEW_PROMPT_EVENT = 'cinescope:site-review-prompt';

export function requestSiteReviewPrompt(trigger = 'manual') {
  window.dispatchEvent(new CustomEvent(SITE_REVIEW_PROMPT_EVENT, {
    detail: { trigger }
  }));
}
