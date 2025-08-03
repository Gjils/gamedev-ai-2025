import type { Component } from 'solid-js';

import Graph from '../Graph/Graph'

import styles from './App.module.css';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Graph />
    </div>
  );
};

export default App;
