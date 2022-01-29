import React from "react";
import {Game} from "/imports/data/game";
import {HandComponent} from "/imports/ui/HandComponent";
import {Button} from "react-bootstrap";

interface GameProps {
    game: Game,
    toDrawState: ()=>void,
}

export const GameComponent: React.FC<GameProps> = ({game, toDrawState}) => {
    return (
        <div className={"row"}>
            <div className={"col"}>
                <h2>Player 1</h2>
                <HandComponent cards={game.player1Hand}></HandComponent>
            </div>
            <div className={"col"}>
                <h2>{game.name}</h2>
                <Button onClick={toDrawState}>To draw state</Button>
            </div>
            <div className={"col"}>
                <h2>Player 2</h2>
                <HandComponent cards={game.player2Hand}></HandComponent>
            </div>
        </div>
    );
}
