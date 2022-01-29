import React from 'react';
import {startDeck} from "/imports/data/card-data";

export const Card = () => {

    return (
        <div>
            {startDeck.map((card) =>
                <>
                    <label>name:</label><span>{card.name}</span>
                    <label>power:</label><span>{card.power}</span>
                    <label>side:</label><span>{card.side}</span>
                    <label>effects:</label>
                </>)}
        </div>
    );
};