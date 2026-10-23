/** Message to show the user: the server's message when there is one, otherwise the fallback. */
export const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback
