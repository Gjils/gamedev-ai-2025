import type { Component } from 'solid-js';

import Graph from '../Graph/Graph';

import { Route, Router } from '@solidjs/router';
import styles from './App.module.css';

const quest_name = 'example-1';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router>
        <Route path={"/:questName"} component={Graph} />
      </Router>
      
    </div>
  );
};

export default App;
