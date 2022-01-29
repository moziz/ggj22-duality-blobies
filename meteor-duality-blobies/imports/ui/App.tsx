import React from 'react';
import { Hello } from './Hello';
import { Info } from './Info';
import {Card} from "/imports/ui/Card";

export const App = () => (
  <div>
    <h1>Welcome to Meteor!</h1>
    <Hello />
    <Info />
    <Card />
  </div>
);
