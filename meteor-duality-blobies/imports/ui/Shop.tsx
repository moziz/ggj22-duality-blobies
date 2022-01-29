import React, {useCallback} from "react"
import {Card} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {CardComponent} from "/imports/ui/CardComponent";

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

    return (
        <>
            <h2>SHOP</h2>
            <p>{infoLabel}</p>
            {offers.map(card => <CardComponent key={card.name} card={card} playCard={onPlayerPurchase} canPlay={active}
                                               playLabel={"Purchace"} />)}
        </>
    );
}

