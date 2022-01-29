import React from 'react';
import {Card as CardData} from "/imports/data/card-data";
import {Button, Card} from "react-bootstrap";


interface CardProps {
    card: CardData,
    playCard: (c: CardData) => void,
    canPlay: boolean,
}

export const CardComponent: React.FC<CardProps> = ({card, playCard, canPlay}) => {
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
                    <Button disabled={!canPlay} onClick={() => playCard(card)}>Play</Button>
                </div>
            </Card.Body>
        </Card>
    );
};
