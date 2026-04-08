import "./appPopup.css";

export default function AppPopup({ aberto, mensagem, onFechar, children }) {
  if (!aberto) return null;

  return (
    <div className="app_popup_backdrop" role="presentation" onClick={onFechar}>
      <div
        className="app_popup"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {mensagem ? <p>{mensagem}</p> : children}
      </div>
    </div>
  );
}
