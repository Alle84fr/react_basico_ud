import React from 'react';
import { createRoot } from 'react-dom/client';
import Button from '../components/Button/indexBu';

class App extends React.Component {

  state = {
    contador: 0,
    nome: " ",
  }

  componentWillUnmount(){
    console.log("componentWillUnmount")
  }
    
  render() {
    return (
      <div>

        <input onChange={this.changeText} />
        nome: {this.state.nome} <br />

        contador: {this.state.contador}

        <h1>Saluton React </h1>



        <Button press={this.adicionar}  corBtn="#9c6644"corTxt="#ede0d4">Default</Button>

      </div>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);