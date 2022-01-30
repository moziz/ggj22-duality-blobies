import React from 'react';
import {Card as CardData, getImage} from "/imports/data/card-data";
import {Button} from "react-bootstrap";


interface CardProps {
    card: CardData,
    playCard?: (c: CardData) => void,
    canPlay?: boolean,
    playLabel?: string,
    faceDown?: boolean,
    highLight?: boolean,
    cannotReason?: string,
}

export const CardComponent: React.FC<CardProps> = (
    {
        card,
        playCard,
        canPlay,
        playLabel,
        faceDown,
        highLight,
        cannotReason,
    }) => {
    return (
        <div className={"m-2 p-1 d-flex flex-column justify-content-between"} style={{
            minWidth: "160px",
            minHeight: "225px",
            maxWidth: "160px",
            maxHeight: "225px",
            borderRadius: "10px",
            border: ((highLight || (faceDown && card.name !== "HIDDEN")) ? "5px" : "2px") + " solid " + (card.side === "Dino" ? "#9B0000" : "#00009B"),
            backgroundColor: card.side === "Dino" ? "#FF5733" : "#6495ED",
            backgroundImage: card.side === "Both" ? "linear-gradient(#FF5733, #FF5733, #6495ED, #6495ED)" : ((faceDown && card.name !== "HIDDEN") ? "url('/imgs/card-back-text.png')" : undefined),
            backgroundRepeat: "no-repeat",
            backgroundOrigin: "center",
            backgroundSize: "auto",
            backgroundPosition: "center",
            boxShadow: (faceDown && !highLight) ? "inset 0 0 0 1000px rgba(255,255,255,.25)" : "",
        }}>
            {!faceDown ? <div className={"d-flex justify-content-between"}>
                <p className={"m-0 card-title"}><b>{card.name}</b></p>
                <p className={"m-0 power"}>{card.power}</p>
            </div> : null}
            {!faceDown ? <div className={"d-flex flex-column justify-content-around align-items-center"} style={{
                height: "90px",
                backgroundImage: "url('/imgs/" + getImage(card.side, card.visuals) + "')",
                backgroundRepeat: "no-repeat",
                backgroundOrigin: "center",
                backgroundSize: "cover",
                backgroundColor: "white",
                backgroundPosition: "center",
                borderRadius: "5px",
                border: "2px solid " + (card.side === "Dino" ? "#9B0000" : "#00009B"),
            }}>
            </div> : null}
            {card.effects.length > 0 ? card.effects.map(
                (effect, index) => {
                    return <p key={effect.cardName + index} className={"m-0"}>{faceDown ? "" : (effect.text)}</p>
                }) : <p/>
            }
            <div className={"d-flex justify-content-around"}>
                {(playCard && !faceDown) ?
                    (
                        canPlay ? (
                                <Button
                                    disabled={!canPlay}
                                    onClick={() => playCard(card)}
                                    size={"sm"}
                                    title={"moi"}
                                >
                                    {playLabel ?? "PLAY"}
                                </Button>
                            ) :
                            <p><small><i>{cannotReason}</i></small></p>
                    ) : null
                }
                {}
            </div>
        </div>
    );
};
