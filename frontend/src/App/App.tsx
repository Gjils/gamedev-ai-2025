import type { Component } from 'solid-js';

import Graph from '../Visualization/Graph/Graph';

import { Route, Router } from '@solidjs/router';
import styles from './App.module.css';
import QuestList from '../QuestList/QusetList';

const quest_name = 'example-1';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router>
        <Route path={"/:questName"} component={Graph} />
        <Route path={"/"} component={QuestList} />
      </Router>
      
    </div>
  );
};

export default App;
