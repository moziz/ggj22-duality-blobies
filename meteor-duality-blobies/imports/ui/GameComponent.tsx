import React from "react";
import {Game} from "/imports/data/game";
import {HandComponent} from "/imports/ui/HandComponent";
import {Button} from "react-bootstrap";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";
import {PlayedCards} from "/imports/ui/PlayedCards";
import {Shop} from "/imports/ui/Shop";
import {getShopTurn} from "/imports/control/game-logic";

interface GameProps {
    game: Game,
    toDrawState: () => void,
    playCard: (c: Card, player: PlayerID) => void,
    purchaseCard: (c: Card, p: PlayerID) => void,
}

export const GameComponent: React.FC<GameProps> = ({game, toDrawState, playCard, purchaseCard}) => {
    return (
        <div className={"row"}>
            <div className={"col"}>
                <h2>Player 1</h2>
                <HandComponent cards={game.players["p1"].hand} game={game} player={"p1"} playCard={playCard}/>
            </div>
            <div className={"col"}>
                <h2>{game.name}</h2>
                <Button onClick={toDrawState}>To draw state</Button>
                <div className={"row"}>
                    <PlayedCards playedCards={game.roundCards} startPlayer={game.roundStarter}/>
                </div>
                <div className={"row"}>
                    <Shop offers={game.shop.offers} turn={getShopTurn(game)} active={game.shop.active}
                          onPurchase={purchaseCard}/>
                </div>
            </div>
            <div className={"col"}>
                <h2>Player 2</h2>
                <HandComponent cards={game.players["p2"].hand} game={game} player={"p2"} playCard={playCard}/>
            </div>
        </div>
    );
}
