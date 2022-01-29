import React from "react";
import {Game} from "/imports/data/game";
import {HandComponent} from "/imports/ui/HandComponent";
import {Button} from "react-bootstrap";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";
import {CardComponent} from "/imports/ui/CardComponent";

interface GameProps {
    game: Game,
    toDrawState: () => void,
    playCard: (c: Card, player: PlayerID) => void,
}

export const GameComponent: React.FC<GameProps> = ({game, toDrawState, playCard}) => {
    return (
        <div className={"row"}>
            <div className={"col"}>
                <h2>Player 1</h2>
                <HandComponent cards={game.player1Hand} game={game} player={"p1"} playCard={playCard}/>
            </div>
            <div className={"col"}>
                <h2>{game.name}</h2>
                <Button onClick={toDrawState}>To draw state</Button>
                <div>
                    {game.roundCards.map(c => <CardComponent card={c} key={c.name}/>)}
                </div>
            </div>
            <div className={"col"}>
                <h2>Player 2</h2>
                <HandComponent cards={game.player2Hand} game={game} player={"p2"} playCard={playCard}/>
            </div>
        </div>
    );
}
