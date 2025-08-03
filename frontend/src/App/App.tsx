import type { Component } from 'solid-js';
import { Route, Router } from '@solidjs/router';

import Graph from '../Visualization/Graph/Graph';
import QuestList from '../QuestList/QusetList';
import Generation from '../Generation/Generation';

import styles from './App.module.css';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Router>
        <Route path={"/:questName"} component={Graph} />
        <Route path={"/"} component={QuestList} />
        <Route path={"/generate"} component={Generation} />  
      </Router>
    </div>
  );
};

export default App;
