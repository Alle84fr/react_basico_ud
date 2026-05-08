<h1>comandos</h1>

>  npm run dev

- ambiente virtual:

> python -m venv venv
venv\Scripts\activate

- criar projeto - npm = node package manager - gerenciamento de pacotes 
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - cerate = crie
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; - vite = build - ferramenta para criar front-end

> npm create vite@latest nome_projeto
React
JavaScript + swc
No
Yes

- entrar na pasta

> cd front_professional

- instalar

> npm install

- tailwind css - framework
- @tailwindcss/vite - integra tailwind ao vite

> npm install tailwindcss @tailwindcss/vite

- react-router-dom - bibliteca que cria rotas - dom (document object model)

> npm install react-router-dom

<h3>Configurar tailwid css</h3>

na pasta raiz 

> import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
&nbsp;&nbsp;plugins: [
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;react(),
&nbsp;&nbsp;&nbsp;&nbsp;tailwindcss(),
&nbsp;&nbsp;],
})


No arquivo src/index.css envolver a aplicação com BrownserRouter

> @@import "tailwindcss";

<h3>Estrutura de roteamento</h3>

>import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PgForm from './PgForm';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PgForm />} />
        {/* Outras rotas seriam adicionadas aqui */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;

> npm run dev no back também