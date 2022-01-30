import React from "react"
import {Card} from "/imports/data/card-data";
import {CardComponent} from "/imports/ui/CardComponent";
import {Button, OverlayTrigger, Popover} from "react-bootstrap";
import {shuffle} from "/imports/control/game-logic";
import {concat} from "lodash";

interface DeckProps {
    cardsInDeck: Card[],
    cardsInHand: Card[],
    cardsInDiscard: Card[],
    title: string,
}

export const Deck: React.FC<DeckProps> = ({cardsInDeck,cardsInDiscard, cardsInHand, title}) => {
    const cardsInHandOrDeck = shuffle(concat(cardsInDeck, cardsInHand));

    const deckContent = (
        <Popover style={{minWidth:"500px", maxHeight:"500px", overflow:"auto"}}>
            <Popover.Header>{title}</Popover.Header>
            <Popover.Body className={"d-flex align-content-around flex-wrap justify-content-center"}>
            <h2 className={"text-center mt-2 mb-1"} style={{width:"100%"}}>Cards in deck and hand</h2>
                {cardsInHandOrDeck.map((card, index) => <CardComponent key={index} card={card}/>)}
            <h2 className={"text-center mt-4 mb-1"} style={{width:"100%"}}>Cards in discard</h2>
                {cardsInDiscard.map((card, index) => <CardComponent key={index} card={card}/>)}
            </Popover.Body>
        </Popover>
    )

    return (
        <OverlayTrigger trigger={"click"} placement={"top"} overlay={deckContent} rootClose>
            <Button>Look Deck</Button>
        </OverlayTrigger>
    );
}

