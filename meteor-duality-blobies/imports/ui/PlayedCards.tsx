import React from "react"
import {Card, Side} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {CardComponent} from "/imports/ui/CardComponent";
import {getPlayedColors} from "/imports/control/game-logic";

interface PlayedCardsProps {
    playedCards: Card[],
    startPlayer: PlayerID,
}

const defaultCard: Card = {
    name: "HIDDEN",
    power: 0,
    side: "Both",
    effects: [],
}

export const PlayedCards: React.FC<PlayedCardsProps> = ({playedCards, startPlayer}) => {
    const sides = getPlayedColors(playedCards);
    let defaultSide: Side;
    if (sides.Cat < 2) {
        if (sides.Dino < 2) {
            defaultSide = "Both";
        } else {
            defaultSide = "Cat"
        }
    } else {
        defaultSide = "Dino"
    }
    defaultCard.side = defaultSide;
    const cards = startPlayer === "p1" ? [
        playedCards.length > 0 ? playedCards[0] : defaultCard,
        playedCards.length > 1 ? playedCards[1] : defaultCard,
        playedCards.length > 3 ? playedCards[3] : defaultCard,
        playedCards.length > 2 ? playedCards[2] : defaultCard,
    ] : [
        playedCards.length > 1 ? playedCards[1] : defaultCard,
        playedCards.length > 0 ? playedCards[0] : defaultCard,
        playedCards.length > 2 ? playedCards[2] : defaultCard,
        playedCards.length > 3 ? playedCards[3] : defaultCard,
    ];

    return (
        <div>
            <p className={"text-center h4"}>Played cards</p>
            <div className={"d-flex align-content-around flex-wrap justify-content-center"} style={{
                width: "400px",
            }}>
                {cards.map((card, index) =>
                    <CardComponent key={index} card={card} faceDown={card.name === "HIDDEN"}/>,
                )}
            </div>
        </div>
    );
}

