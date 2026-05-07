# Como colocar o app no celular

Este projeto agora tem a parte PWA pronta. Isso significa que, quando o front estiver publicado em uma URL HTTPS, o Chrome do Android pode instalar o site como se fosse um app, com icone na tela inicial.

## Caminho mais simples para apresentar

1. Publique o backend em algum servico Node com HTTPS, por exemplo Render, Railway ou outro parecido.
2. No backend publicado, configure as variaveis do `back/.env.example`.
3. Configure `FRONTEND_ORIGIN` no backend com a URL onde o front vai ficar.
4. Publique o front em Netlify, Vercel ou GitHub Pages.
5. No front publicado, configure a variavel `VITE_API_URL` com a URL do backend publicado.
6. Abra a URL do front no Chrome do Android.
7. Toque nos tres pontinhos do Chrome e escolha `Instalar app` ou `Adicionar a tela inicial`.

Depois disso, o app aparece com icone no celular e abre em tela cheia, sem parecer uma aba comum do navegador.

## Observacao importante

O front sozinho ate abre, mas as telas que fazem login, cadastro, lista de funcionarios e lista de animais precisam do backend. No celular, `http://localhost:4000` nao funciona, porque `localhost` no celular aponta para o proprio celular, nao para seu computador.

Para mostrar para o professor de forma confiavel, o melhor e publicar backend e front. O GitHub ajuda porque Netlify, Vercel, Render e Railway conseguem pegar o codigo direto do repositorio.

## Teste no seu computador

No backend:

```bash
cd back
npm install
npm run dev
```

No front:

```bash
cd front
npm install
npm run build
npm run preview
```

Abra a URL do preview no navegador. Para o botao de instalar aparecer no celular, precisa ser uma URL HTTPS publicada ou `localhost` no proprio aparelho.
