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
    clientPlayer?: PlayerID,
}

export const Shop: React.FC<ShopProps> = ({offers, turn, active, onPurchase, clientPlayer}) => {

    const infoLabel = active ? "Player " + turn + " should select a new card!"
        : "Play 4 cards to finish the round first then the Loser of the round will buy first.";

    const onPlayerPurchase = useCallback((c: Card) => onPurchase(c, turn), [turn, onPurchase]);
    const shopContent = (
        <Popover style={{minWidth: "600px"}}>
            <Popover.Header>SHOP</Popover.Header>
            <Popover.Body className={"d-flex align-content-around flex-wrap justify-content-center"}>
                <h5 style={{width: "100%"}}>{infoLabel}</h5>
                {offers.map((card, index) => <CardComponent
                    key={index}
                    card={card}
                    playCard={onPlayerPurchase}
                    canPlay={active && turn === clientPlayer}
                    cannotReason={"Not your turn to buy!"}
                    playLabel={"Purchace"}
                />)}
            </Popover.Body>
        </Popover>
    )

    return (
        <OverlayTrigger show={active ? true : undefined}
                        defaultShow={active ? true : undefined}
                        trigger={"click"}
                        placement={"bottom"}
                        overlay={shopContent}
                        rootClose>
            <Button>SHOP</Button>
        </OverlayTrigger>
    );
}

