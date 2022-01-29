import React from 'react';
import {Card} from "/imports/data/card-data";

interface CardProps {
    card: Card
}

export const CardComponent: React.FC<CardProps> = ({card}) => {
    return (
        <div>
            <label>name:</label><span>{card.name}</span>
            <label>power:</label><span>{card.power}</span>
            <label>side:</label><span>{card.side}</span>
            <label>effects:</label>
        </div>
    );
};
