import React from 'react';
import {Card} from "/imports/data/card-data";
import {CardComponent} from "./CardComponent"
import {PlayerID} from "/imports/data/player";
import {Game} from "/imports/data/game";
import {canPlayCard, getCannotReason} from "/imports/control/game-logic";

interface HandProps {
    cards: Card[],
    game: Game,
    player: PlayerID,
    playCard: (c: Card, player: PlayerID) => void,
    faceDown: boolean,
}

export const HandComponent: React.FC<HandProps> = ({cards, game, player, playCard, faceDown}) => {
    const playCardFromHand = React.useCallback((card: Card) => playCard(card, player), [player, playCard]);
    return (
        <>
            <h4 className={"text-center"}>Hand</h4>
            <div className={"d-flex flex-wrap justify-content-center"}
                 style={{maxHeight: "650px", overflow: "auto", width: "100%"}}>
                {cards.map((card, index) =>
                    <CardComponent key={index}
                                   card={card}
                                   canPlay={canPlayCard(game, card, player)}
                                   cannotReason={getCannotReason(game, card, player)}
                                   playCard={playCardFromHand}
                                   faceDown={faceDown}
                    />,
                )}
            </div>
        </>
    );
};
