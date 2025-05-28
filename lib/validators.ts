// lib/validators.ts
export function validateSessionId(id: string | string[] | undefined): string {
  if (!id) throw new Error("Session ID is missing");

  const sessionId = Array.isArray(id) ? id[0] : id;

  if (!sessionId.match(/^[a-zA-Z0-9-_]+$/)) {
    throw new Error("Invalid session ID format");
  }

  return sessionId;
}
