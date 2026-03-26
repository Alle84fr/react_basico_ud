import { Route, Routes } from "react-router-dom";
import PgCad from "./pages/PgCad";
import PgHome from "./pages/PgHome";
import PgIni from "./pages/PgIni";
import PgLog from "./pages/PgLog";
import PgSplash from "./pages/PgSplash";

function PgNaoEncontrada() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <section>
        <h1 style={{ marginBottom: "12px" }}>404 - Pagina nao encontrada</h1>
        <p>O caminho informado nao existe no front.</p>
      </section>
    </main>
  );
}

function PgEmConstrucao({ titulo = "Em construcao" }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <section>
        <h1 style={{ marginBottom: "12px" }}>{titulo}</h1>
        <p>Esta pagina ainda sera montada.</p>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PgSplash />} />
      <Route path="/splash" element={<PgSplash />} />
      <Route path="/inicial" element={<PgIni />} />
      <Route path="/cadastrar" element={<PgCad />} />
      <Route path="/logar" element={<PgLog />} />
      <Route path="/home" element={<PgHome />} />
      <Route path="/adicionar-funcionario" element={<PgEmConstrucao titulo="Adicionar funcionario" />} />
      <Route path="/adicionar-animal" element={<PgEmConstrucao titulo="Adicionar animal" />} />
      <Route path="/lista-funcionarios" element={<PgEmConstrucao titulo="Lista funcionarios" />} />
      <Route path="/lista-animal" element={<PgEmConstrucao titulo="Lista animal" />} />
      <Route path="/deve" element={<PgEmConstrucao titulo="Deve" />} />
      <Route path="/guia-app" element={<PgEmConstrucao titulo="Guia do app" />} />
      <Route path="*" element={<PgNaoEncontrada />} />
    </Routes>
  );
}
