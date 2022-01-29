import React, {useState} from 'react';
import {GameComponent} from "/imports/ui/GameComponent";
import {drawPhase, startNewGame} from "/imports/control/game-logic";
import {cloneDeep} from "lodash";

const toState = [{name:"Draw", fn:drawPhase}]

export const App = () => {
    const [game, setGame] = useState(startNewGame());

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
            <GameComponent game={game} toDrawState={toDrawState}/>
        </div>
    );
};
