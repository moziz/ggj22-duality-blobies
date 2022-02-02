import React from "react";
import {Game} from "/imports/data/game";
import {HandComponent} from "/imports/ui/HandComponent";
import {Button} from "react-bootstrap";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";
import {PlayedCards} from "/imports/ui/PlayedCards";
import {Shop} from "/imports/ui/Shop";
import {getPlayersPower, getShopTurn} from "/imports/control/game-logic";
import {Chat} from "/imports/ui/Chat";
import {Deck} from "/imports/ui/Deck";
import {useAudio, useMultiAudio} from "/imports/ui/useAudio";

interface GameProps {
    game: Game,
    toDrawState: () => void,
    playCard: (c: Card, p: PlayerID) => void,
    purchaseCard: (c: Card, p: PlayerID) => void,
    clientPlayer?: PlayerID,
}

const catAudios = [
    "/sounds/Meow.ogg",
    "/sounds/miau.wav",
    "/sounds/mikko_miau.mp3",
];

const dinoAudios = [
    "/sounds/roar-sound-effect.mp3",
    "/sounds/rauh.wav",
    "/sounds/mikko_rauh.mp3",
];

export const GameComponent: React.FC<GameProps> = ({game, toDrawState, playCard, purchaseCard, clientPlayer,useDeckVariant}) => {
    const gameStarted = game.players.p1.hand.length > 0 || game.roundNumber > 1;
    const [playingCat, toggleCat] = useMultiAudio(catAudios, 0.3);
    const [playingDino, toggleDino] = useMultiAudio(dinoAudios, 0.2);
    const [playingBuy, toggleBuy] = useAudio("/sounds/cash.mp3", 0.2);
    const playCardWithSound = React.useCallback((c: Card, p: PlayerID) => {
            if (c.side === "Dino") {
                if (!playingDino) {
                    toggleDino();
                }
            } else {
                if (!playingCat) {
                    toggleCat();
                }
            }
            playCard(c, p);
        },
        [playingCat, playingDino, toggleCat, toggleDino, playCard],
    )
    const purchaseCardWithSound = React.useCallback((c: Card, p: PlayerID) => {
            if (!playingBuy) {
                toggleBuy();
            }
            purchaseCard(c, p);
        },
        [playingBuy, toggleBuy, purchaseCard],
    )

    const powers = getPlayersPower(game);
    const scores = {p1: game.players.p1.score, p2: game.players.p2.score};
    const gameEnded = (scores.p2 >= 20 || scores.p1 >= 20)
    const gameEndedElement = gameEnded ?
        <div className={"col-4 d-flex flex-column justify-content-center align-items-center"}>
            <h1 className={"text-center pulse"}>Winner is {scores.p2 >= 20 ? "P2" : "p1"}</h1>
        </div> : undefined;

    const playArea = gameEndedElement || (
        <div className={"col-4 d-flex flex-column justify-content-between align-items-center"}>
            <h2 className={"text-center"}>{game.name}</h2>
            <p className={"h4"}>{game.message}</p>
            {!gameStarted ? (<Button onClick={toDrawState}>Start game</Button>) : null}
            <div className={"row"}>
                {gameStarted ?
                    <PlayedCards playedCards={game.roundCards}
                                 startPlayer={game.roundStarter}
                                 p1Power={powers.p1}
                                 p2Power={powers.p2}/>
                    : null
                }
            </div>
            <div className={"flex-grow-1"}></div>
            <div className={"mb-4 row"}>
                {gameStarted ?
                    <Shop
                        offers={game.shop.offers}
                        turn={getShopTurn(game)}
                        active={game.shop.active}
                        onPurchase={purchaseCardWithSound}
                        clientPlayer={clientPlayer}
                    /> : null
                }
            </div>
        </div>
    );

    return (
        <>
            <div className={"row p-2"} style={{
                width: "1296px",
                height: "900px",
                backgroundImage: "url('/imgs/cat_backround.jpg')",
                boxShadow: "inset 0 0 0 1000px rgba(255,255,255,.5)",
            }}>
                <div className={"col-4 d-flex flex-column p-0"}>
                    <h2 className={"text-center"}>Player 1</h2>
                    {game.players["p1"].score ?
                        <h5 className={"text-center"}>Score {game.players["p1"].score} / 20</h5> : null}
                    <HandComponent cards={game.players["p1"].hand}
                                   game={game}
                                   player={"p1"}
                                   playCard={gameEnded ? undefined : playCardWithSound}
                                   faceDown={!gameEnded && clientPlayer !== "p1"}
                    />
                    {gameStarted ? <Deck cardsInDeck={game.players.p1.deck} cardsInHand={game.players.p1.hand}
                                         cardsInDiscard={game.players.p1.discard} title={"Player 1 cards"}/> : null}
                </div>
                {playArea}
                <div className={"col-4 d-flex flex-column p-0"}>
                    <h2 className={"text-center"}>Player 2</h2>
                    {game.players["p2"].score ?
                        <h5 className={"text-center"}>Score {game.players["p2"].score} / 20</h5> : null}
                    <HandComponent cards={game.players["p2"].hand}
                                   game={game}
                                   player={"p2"}
                                   playCard={gameEnded ? undefined : playCardWithSound}
                                   faceDown={!gameEnded && clientPlayer !== "p2"}
                    />
                    {gameStarted ? <Deck cardsInDeck={game.players.p2.deck} cardsInHand={game.players.p2.hand}
                                         cardsInDiscard={game.players.p2.discard} title={"Player 2 cards"}/> : null}
                </div>
            </div>
            <Chat game={game} clientPlayer={clientPlayer}/>
        </>
    );
}
