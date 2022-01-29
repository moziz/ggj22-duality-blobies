import React from "react"
import {Card} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {CardComponent} from "/imports/ui/CardComponent";

interface PlayedCardsProps {
    playedCards: Card[],
    startPlayer: PlayerID,
}

export const PlayedCards: React.FC<PlayedCardsProps> = ({playedCards, startPlayer}) => {
    const leftCards = (
        <div className={"col"}>
            {}
        </div>
    );

    const rightCards = (
        <div className={"col"}>
            {}
        </div>
    );

    return (
        <>
            {leftCards}
            {rightCards}
            {playedCards.map(value => <CardComponent card={value}/>)}
        </>
    );
}

