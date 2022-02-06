import React from "react"
import {Card, Side} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {CardComponent} from "/imports/ui/CardComponent";
import {getPlayedColors} from "/imports/control/game-logic";
import {CatIcon, DinoIcon} from "/imports/ui/icons";
import {Game} from "/imports/data/game";

interface PlayedCardsProps {
    playedCards: (Card | undefined)[],
    startPlayer: PlayerID,
    p1Power: number,
    p2Power: number,
    game: Game,
}

const defaultCard: Card = {
    name: "HIDDEN",
    power: 0,
    side: "Both",
    effects: [],
    visuals: 0,
}

const highLights = {
    p1: [0, 1, 3, 2, 9],
    p2: [1, 0, 2, 3, 9],
}

const turnByStarter: Record<PlayerID, PlayerID[]> = {
    p1: ["p1", "p2", "p2", "p1"],
    p2: ["p2", "p1", "p1", "p2"],
}


export const PlayedCards: React.FC<PlayedCardsProps> = ({game, p1Power, p2Power}) => {
    const playedCards = game.roundCards;
    const startPlayer = game.roundStarter;
    const sides = getPlayedColors(playedCards);
    let defaultSide: Side;
    if (sides.Cat < 2) {
        if (sides.Dino < 2) {
            defaultSide = "Both";
        } else {
            defaultSide = "Cat"
        }
    } else {
        defaultSide = "Dino"
    }
    defaultCard.side = defaultSide;
    const cards = startPlayer === "p1" ? [
        playedCards[0] ?? defaultCard,
        playedCards[1] ?? defaultCard,
        playedCards[3] ?? defaultCard,
        playedCards[2] ?? defaultCard,
    ] : [
        playedCards[1] ?? defaultCard,
        playedCards[0] ?? defaultCard,
        playedCards[2] ?? defaultCard,
        playedCards[3] ?? defaultCard,
    ];
    let active = 0;
    while (playedCards[active]) {
        active++;
    }
    const highLightIndex = highLights[startPlayer][active];
    const total = sides.Cat + sides.Dino;
    const balance = total === 0 ? 0.5 : sides.Cat / total;

    return (
        <div>
            <p className={"text-center h4"}>Played cards</p>
            <div className={"d-flex justify-content-between"}>
                <div/>
                <div/>
                <div className={"big-power" + (p1Power > p2Power ? " winner-power" : "")}>{p1Power}</div>
                <div/>
                <div/>
                <div className={"big-power" + (p1Power < p2Power ? " winner-power" : "")}>{p2Power}</div>
                <div/>
                <div/>
            </div>
            <div className={"d-flex align-content-around flex-wrap justify-content-center"} style={{
                width: "400px",
            }}>
                <CardComponent
                    card={cards[0]}
                    faceDown={cards[0].name === "HIDDEN"}
                    highLight={0 === highLightIndex}
                    message={0 === highLightIndex ? game.players[turnByStarter[startPlayer][0]].name + " turn to play" : undefined}
                />
                <div className={"splitter"}></div>
                <CardComponent
                    card={cards[1]}
                    faceDown={cards[1].name === "HIDDEN"}
                    highLight={1 === highLightIndex}
                    message={1 === highLightIndex ? game.players[turnByStarter[startPlayer][1]].name + " turn to play" : undefined}
                />
                <CardComponent
                    card={cards[2]}
                    faceDown={cards[2].name === "HIDDEN"}
                    highLight={2 === highLightIndex}
                    message={2 === highLightIndex ? game.players[turnByStarter[startPlayer][2]].name + " turn to play" : undefined}
                />
                <div className={"splitter"}></div>
                <CardComponent
                    card={cards[3]}
                    faceDown={cards[3].name === "HIDDEN"}
                    highLight={3 === highLightIndex}
                    message={3 === highLightIndex ? game.players[turnByStarter[startPlayer][3]].name + " turn to play" : undefined}
                />
            </div>
            <label htmlFor="customRange1" className="form-label m-0 ps-4 pe-4"><i>Keep the balance!</i></label>
            <div className={"d-flex ps-4 pe-4 mb-4"}>
                <div className={"me-2 icon"}><DinoIcon/></div>
                <input type="range" className="form-range" id="customRange1" disabled value={balance * 100}/>
                <div className={"ms-2 icon"}><CatIcon/></div>
            </div>
        </div>
    );
}

