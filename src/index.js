import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '../components/Button/indexBu';

class App extends React.Component {
  render() {
    return (
      <div>

        <h1>Saluton React </h1>

        <Button>Salvar</Button>

        <Button>Ressuscitar</Button>

        <Button>Morrer</Button>

      </div>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);