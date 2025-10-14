import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '../components/Button/indexBu';

class App extends React.Component {
  render() {
    return (
      <div>

        <h1>Saluton React </h1>

        <Button cor="#0077b6">cor background</Button>

        <Button >Ressuscitar</Button>

        <Button>Morrer</Button>

      </div>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);