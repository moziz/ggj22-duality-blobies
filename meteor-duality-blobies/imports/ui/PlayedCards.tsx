import React from "react"
import {Card} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {CardComponent} from "/imports/ui/CardComponent";

interface PlayedCardsProps {
    playedCards: Card[],
    startPlayer: PlayerID,
}

export const PlayedCards: React.FC<PlayedCardsProps> = ({playedCards, startPlayer}) => {
    const firstCards = (
        <div className={"col"}>
            {playedCards.length > 0 ? <CardComponent card={playedCards[0]}/> : null}
            {playedCards.length > 3 ? <CardComponent card={playedCards[3]}/> : null}
        </div>
    );

    const secondCards = (
        <div className={"col"}>

            {playedCards.length > 1 ? <CardComponent card={playedCards[1]}/> : null}
            {playedCards.length > 2 ? <CardComponent card={playedCards[2]}/> : null}
        </div>
    );

    return (
        <>
            {startPlayer === "p1" ? firstCards : secondCards}
            {startPlayer === "p1" ? secondCards : firstCards}
        </>
    );
}

