import React from 'react';
import {GameComponent} from "/imports/ui/GameComponent";
import {drawPhase, startNewGame, playCardInGame, handlePurchase} from "/imports/control/game-logic";
import {cloneDeep} from "lodash";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";
import {Button} from "react-bootstrap";


const randomString = (len: number) => {
    const letters = "ABCDEFHJKMPRSTU2345789";
    let result = ""
    while (result.length < len) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}

export const App = () => {

    const [code] = React.useState(randomString(6));


    return (
        <div className={"container-fluid"}>
            <h1>Start new game</h1>
            <a className={"btn btn-primary"} href={"/game/"+ code} role={"button"}>Start game {code}</a>
        </div>
    );
};
