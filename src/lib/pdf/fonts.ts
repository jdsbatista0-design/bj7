// Built-in PDF fonts only (Helvetica family) to avoid external 404s.
// We keep ensureFonts as a no-op for backwards compatibility.
export function ensureFonts() {
  /* no-op: using @react-pdf built-in Helvetica */
}