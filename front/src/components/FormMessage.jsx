export function FormMessage({ type = "info", text }) {
  if (!text) return null;

  return <div className={`message ${type}`}>{text}</div>;
}
