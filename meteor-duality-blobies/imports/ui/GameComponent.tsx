import React from "react";
import {Game} from "/imports/data/game";
import {HandComponent} from "/imports/ui/HandComponent";
import {Button} from "react-bootstrap";
import {PlayerID} from "/imports/data/player";
import {Card} from "/imports/data/card-data";
import {PlayedCards} from "/imports/ui/PlayedCards";
import {Shop} from "/imports/ui/Shop";
import {getShopTurn} from "/imports/control/game-logic";
import {Chat} from "/imports/ui/Chat";

interface GameProps {
    game: Game,
    toDrawState: () => void,
    playCard: (c: Card, player: PlayerID) => void,
    purchaseCard: (c: Card, p: PlayerID) => void,
    clientPlayer?: PlayerID,
}

export const GameComponent: React.FC<GameProps> = ({game, toDrawState, playCard, purchaseCard, clientPlayer}) => {
    const gameStarted = game.players.p1.hand.length && game.roundNumber !== 0;
    return (
        <>
            <div className={"row p-2"} style={{
                width: "1296px",
                height: "900px",
                backgroundImage: "url('/imgs/cat_backround.jpg')",
                boxShadow: "inset 0 0 0 1000px rgba(255,255,255,.5)",
            }}>
                <div className={"col-3 d-flex flex-column"}>
                    <h2 className={"text-center"}>Player 1</h2>
                    <h2 className={"text-center"}>Score {game.players["p1"].score}</h2>
                    <HandComponent cards={game.players["p1"].hand}
                                   game={game} player={"p1"}
                                   playCard={playCard}
                                   faceDown={clientPlayer !== "p1"}
                    />
                </div>
                <div className={"col-6 d-flex flex-column justify-content-between align-items-center"}>
                    <h2 className={"text-center"}>{game.name}</h2>
                    <p className={"h4"}>{game.message}</p>
                    {!gameStarted ? (<Button onClick={toDrawState}>Start game</Button>) : null}
                    <div className={"row"}>
                        <PlayedCards playedCards={game.roundCards} startPlayer={game.roundStarter}/>
                    </div>
                    <div className={"flex-grow-1"}></div>
                    <div className={"mb-4 row"}>
                        {gameStarted ?
                            <Shop
                                offers={game.shop.offers}
                                turn={getShopTurn(game)}
                                active={game.shop.active}
                                onPurchase={purchaseCard}
                            /> : null
                        }
                    </div>
                </div>
                <div className={"col-3 d-flex flex-column"}>
                    <h2 className={"text-center"}>Player 2</h2>
                    <h2 className={"text-center"}>Score {game.players["p2"].score}</h2>
                    <HandComponent cards={game.players["p2"].hand}
                                   game={game} player={"p2"}
                                   playCard={playCard}
                                   faceDown={clientPlayer !== "p2"}
                    />
                </div>
            </div>
            <Chat game={game} clientPlayer={clientPlayer}/>
        </>
    );
}
