import React from 'react';
import {GameComponent} from "/imports/ui/GameComponent";
import {drawPhase, startNewGame,playCardInGame} from "/imports/control/game-logic";
import {cloneDeep} from "lodash";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";

const toState = [{name:"Draw", fn:drawPhase}]

export const App = () => {
    const [game, setGame] = React.useState(startNewGame());

    const playCard = React.useCallback((c:Card, p:PlayerID)=>{
        setGame(prevState => {
            const game = cloneDeep(prevState);
            playCardInGame(game, c, p);
            return game;
        })
    }, [setGame])

    const toDrawState = React.useCallback(()=>{
        setGame(prevState => {
            const game = cloneDeep(prevState);
            drawPhase(game);
            return game;
        })
    }, [setGame])
    return(
        <div className={"container-fluid"}>
            <h1>Doality Blobies</h1>
            <GameComponent game={game} toDrawState={toDrawState} playCard={playCard}/>
        </div>
    );
};
