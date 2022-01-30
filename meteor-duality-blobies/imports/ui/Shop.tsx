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
    clientPlayer: PlayerID,
}

export const Shop: React.FC<ShopProps> = ({offers, turn, active, onPurchase, clientPlayer}) => {

    const infoLabel = active ? "Player " + turn + " should select a new card!"
        : "Play 4 cards to finish round and open the shop. Loser selects first.";

    //TODO get active player from client, and not from who's turn it is
    const onPlayerPurchase = useCallback((c: Card) => onPurchase(c, turn), [turn, onPurchase]);
    const shopContent = (
        <Popover style={{minWidth: "500px"}}>
            <Popover.Header>SHOP</Popover.Header>
            <Popover.Body className={"d-flex align-content-around flex-wrap justify-content-center"}>
                <p style={{width:"100%"}}>{infoLabel}</p>
                {offers.map((card, index) => <CardComponent key={index} card={card} playCard={onPlayerPurchase}
                                                            canPlay={active && turn === clientPlayer}
                                                            playLabel={"Purchace"}/>)}
            </Popover.Body>
        </Popover>
    )

    return (
        <OverlayTrigger show={active ? true : undefined} trigger={"click"} placement={"top"} overlay={shopContent}
                        rootClose>
            <Button>SHOP</Button>
        </OverlayTrigger>
    );
}

