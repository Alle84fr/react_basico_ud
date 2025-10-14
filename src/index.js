import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '../components/Button/indexBu';

class App extends React.Component {
  render() {
    return (
      <div>

        <h1>Saluton React </h1>

        <Button cor="#0077b6">forma 1 invalidada</Button>

        <Button corBtn="#caf0f8" corTxt="#fb6f92">forma 2 geral</Button>

        <Button corBtn="#a7c957">forma 2 backg</Button>

        <Button corTxt="#9d4edd">forma 2 texto</Button>

      </div>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);