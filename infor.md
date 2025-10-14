# Coisas

### .jsx

Tem por especialidade transforma cód estrutural em algo mais front, tipo tag e propriedades.
É o html do java script (são partes do html dentro js)

### babel

Ele faz a transpiração (transforma cód para cód react)
Transfroma as filters mais recentes de uma forma que navegador antigo entenda.
Trabalha com Webpackage (automatiza o processo, matendo contante atualização - digitou aconteceu)

### links

[medium henrique weaind](https://medium.com/@henrique.weiand)

https://medium.com/@henrique.weiand

https://medium.com/@henrique.weiand/react-configura%C3%A7%C3%B5es-iniciais-de-um-projeto-plano-de-aula-ii-5a24fc6372be

https://medium.com/@henrique.weiand/react-criando-o-primeiro-component-plano-de-aula-iii-6adb871f42b7

https://medium.com/@henrique.weiand/react-propriedades-children-plano-de-aula-iv-488beb6ba94a

https://medium.com/@henrique.weiand/react-defaultprops-proptypes-plano-de-aula-vi-2ac0f990cdd9

https://medium.com/@henrique.weiand/react-react-estado-imutabilidade-plano-de-aula-1f4bc4ea75b9

https://medium.com/@henrique.weiand/react-component-stateful-stateless-plano-de-aula-vii-8a928cdf3eb1

https://medium.com/@henrique.weiand/react-ferramentas-de-padroniza%C3%A7%C3%A3o-de-c%C3%B3digo-plano-de-aula-ix-78d687d69ac5

https://medium.com/@henrique.weiand/react-obtendo-informa%C3%A7%C3%B5es-externas-plano-de-aula-xi-3a76b1a103eb

## Aula 2 configuração de ambinete

- 1° criar arquivo package.json

powershell (usou fora do vscode, fiz dentro)

estar na pasta

```npm init -y```

criar ponto de partida - dependencias da aplicação para buidar e desenvolver

- 2° intalações

``` npm install react react-dom ```
pede para que o npm faça download de pacote

```npm install -D @babel/core @babel/preset-env @babel/preset-react @babel/plugin-proposal-class-properties babel-loader webpack webpack-cli webpack-dev-server css-loader style-loader sass ```

-D para mostrar que estas dependências serão instalada com dependência de Desenvolvimento

- 3°Criar file <b>.babelrc</b>

colar

```{
  "presets": [
    "@babel/preset-env",
    "@babel/preset-react"
  ],
  "plugins": [
    "@babel/plugin-proposal-class-properties"
  ]
} 
```

- 3° Criar file <b>webpack.config.js</b>

```const path = require('path');

module.exports = {
  mode: 'development', 

  entry: path.join(__dirname, 'src', 'index.js'),

  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'public'), 
    },
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
    ],
  },
};

```

### Estrutura das pasta

- 1° criar folder public - file index.html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>GoReact</title>
  </head>
  <body>
    <div id="app"></div>

    <script src="./bundle.js"></script>
  </body>
</html>

- 2° Criar folder crs e file index.js

```import React from 'react';
import ReactDOM, { render } from 'react-dom';
import App from "./App";

class App extends React.Component {
  render() {
    return (
      <h1>
        Saluton React, komincanto!!
      </h1>
    );
  }
}

const root = createRoot
```

- 3° no package.json

achar 

  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },

e por no lugar

```  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack-dev-server --mode=development",
    "build": "webpack --mode production"
  },
  ```

### aquivo bundle

```npm run build```

Irá gerar dentro da pasta public bundle.js e um .txt

Converte tudo para que o navegador entenda

Pega infromações do script do packge.json

### para acontecer em tempo real

``` npm run dev ```

Pega infromação do script dev e roda

dará uma url 

http://localhost:8080/

o n° da porta pode mudar

##  aula Componentes

componentes header, img principal, tudo que está na página

criar duas pastas juntas escreva o nome/outroNome - sem espaço entre eles

ex: components/Button

usar camel case para não ter erro

ele fez index.js , com este nome o import seria import Button from '../components/Button. 

Como mudei o import é o que está no file index.js
 
 EXTENDS exetender ao Components

 método render  ()

 interface força declaração na interface

#### duas formas de ter button no index.js

< Button>< /Button>
< Button />

#### No import

expost com default - identifica que o que será importado é, por explo nome da classe
ao importar não tem chaves

Quando tem Export tipo const, aí deve se por as {} no import

## Components 2:

src = pasta nível raiz

index.js

react-dom - Render, pega o componente do file, "linka" com o App do render(<App />...) e este App está conectado com o app do index.html, mais especificamente com o <div id="app"></div>. Por sinal deve ser escrita desta forma.
No index.html o bundle irá interpeta o código e insere o conteúdo na div id="app"

## Props e Children

Reutilização maior do button

Tirando conteúdo statático

Quando passo um valor no meio da tag

ex: <Button>Forma um</Button>

Será chamado de children, para acessar usa

{this.props.children}

ele pega o conteúdo infromado e joga na propriedade button do indexBu.js

Conteúdo de fora para dentro
