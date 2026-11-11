/**
 * What the feedback form may send and the /api/feedback route accepts. Both sides
 * read these, so a limit changes in one place.
 */

export const MAX_SHOTS = 3

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]

/** All screenshots together. The hosting request limit is 4.5 MB; this leaves room for the rest of the form. */
export const MAX_SHOTS_BYTES = 3.6 * 1024 * 1024

/** Machine codes the route answers with; the form shows its own text for each. */
export const FEEDBACK_ERRORS = {
  tooLarge: "too_large",
  tooMany: "too_many",
} as const
