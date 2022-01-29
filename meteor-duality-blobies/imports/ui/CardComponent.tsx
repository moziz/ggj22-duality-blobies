import React from 'react';
import {Card as CardData} from "/imports/data/card-data";
import {Button, Card} from "react-bootstrap";


interface CardProps {
    card: CardData,
    playCard?: (c: CardData) => void,
    canPlay?: boolean,
    playLabel?: string,
}

export const CardComponent: React.FC<CardProps> = (
    {
        card,
        playCard,
        canPlay,
        playLabel,
    }) => {
    return (
        <Card className={"mb-3"}>
            <Card.Header className={"d-flex justify-content-around"}><b>{card.name}</b></Card.Header>
            <Card.Body className={"d-flex- flex-column justify-content-around"}
                       style={{backgroundColor: card.side === "Dino" ? "#FF5733" : "#6495ED"}}>
                <p className={"text-center"} style={{fontSize: 144}}>{card.power}</p>
                {card.effects.length > 0 ? card.effects.map(
                    effect => {
                        return <p key={effect.name}>{effect.text ?? effect.name}</p>
                    }) : null
                }
                <div className={"d-flex justify-content-around"}>
                    {playCard ? <Button disabled={!canPlay}
                                        onClick={() => playCard(card)}>{playLabel ?? "PLAY"}</Button> : null}
                </div>
            </Card.Body>
        </Card>
    );
};
