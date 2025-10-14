import React from 'react';
import { createRoot } from 'react-dom/client';

class App extends React.Component {
  render() {
    return (
      <h1>Saluton React </h1>
    );
  }
}

const container = document.getElementById('app');
const root = createRoot(container);

root.render(<App />);