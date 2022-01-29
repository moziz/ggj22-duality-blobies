import React from "react";
import {Game} from "/imports/data/game";

interface GameProps{
    game:Game
}

export const GameComponent: React.FC<GameProps> = ({game}) => {
    return (
        <div>
            {game.name}
        </div>
    );
}
