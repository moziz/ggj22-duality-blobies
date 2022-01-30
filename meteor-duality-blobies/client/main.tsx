import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import { App } from '/imports/ui/App'
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {GameView} from "/imports/ui/GameView";

Meteor.startup(() => {
  const rootElement = document.getElementById('react-target');
  ReactDOM.render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}/>
            <Route path="game" element={<App />} >
                <Route path=":gameId" element={<GameView />} />
            </Route>
        </Routes>
      </BrowserRouter>,
      rootElement
  );
});