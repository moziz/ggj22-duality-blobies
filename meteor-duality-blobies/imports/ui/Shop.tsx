import React, {useCallback} from "react"
import {Card} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {CardComponent} from "/imports/ui/CardComponent";
import {Button, OverlayTrigger, Popover} from "react-bootstrap";

interface ShopProps {
    offers: Card[],
    turn: PlayerID,
    active: boolean,
    onPurchase: (c: Card, p: PlayerID) => void,
}

export const Shop: React.FC<ShopProps> = ({offers, turn, active, onPurchase}) => {

    const infoLabel = active ? "Player " + turn + " should select a new card!"
        : "Play 4 cards to finish round and open the shop. Loser selects first.";

    //TODO get active player from client, and not from who's turn it is
    const onPlayerPurchase = useCallback((c: Card) => onPurchase(c, turn), [turn]);
    const shopContent = (
        <Popover>
            <Popover.Header>SHOP</Popover.Header>
            <Popover.Body>
                <p>{infoLabel}</p>
                {offers.map(card => <CardComponent key={card.name} card={card} playCard={onPlayerPurchase}
                                                   canPlay={active}
                                                   playLabel={"Purchace"}/>)}
            </Popover.Body>
        </Popover>
    )

    return (
        <OverlayTrigger trigger={"click"} placement={"bottom"} overlay={shopContent} rootClose>
            <Button>SHOP</Button>
        </OverlayTrigger>
    );
}

