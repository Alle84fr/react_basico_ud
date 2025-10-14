import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '../components/Button/indexBu';

class App extends React.Component {
  render() {
    return (
      <div>

        <h1>Saluton React </h1>



        <Button corTxt="#9d4edd">Default</Button>

        <Button title="Prop /" decricao="valores na tag ">Propriedade</Button>

      </div>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);