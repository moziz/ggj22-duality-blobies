import React from 'react';
import {Card} from "/imports/data/card-data";
import {CardComponent} from "./CardComponent"

interface HandProps {
    cards: Card[]
}

export const HandComponent: React.FC<HandProps> = ({cards}) => {

    return (
        <div>
            {cards.map((card) =>
                <CardComponent key={card.name} card={card} />
            )}
        </div>
    );
};
