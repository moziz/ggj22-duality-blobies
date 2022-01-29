import React from 'react';
import { Hello } from './Hello';
import {GameComponent} from "/imports/ui/Game";
import {startNewGame} from "/imports/control/game-logic";

export const App = () => (
  <div className={"container-fluid"}>
    <h1>Welcome to Meteor!</h1>
    <Hello />
    <GameComponent game={startNewGame()} />
  </div>
);
