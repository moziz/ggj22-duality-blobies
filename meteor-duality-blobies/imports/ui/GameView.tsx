import React from "react";
import {useParams} from "react-router-dom";
import {useTracker} from 'meteor/react-meteor-data'
import {Game, GameCollection, GameOptions} from "/imports/data/game";

import {Meteor} from "meteor/meteor";
import {GameComponent} from "/imports/ui/GameComponent";
import {drawPhase, handlePurchase, playCardInGame, startNewGame} from "/imports/control/game-logic";
import {Card, startDeck, startDeckSplitCat, startDeckSplitDino} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {cloneDeep} from "lodash";
import {Button, ButtonGroup} from "react-bootstrap";
import {AddGameMessage} from "/imports/data/chat";

const useGame = (gameId: string = "") => useTracker(() => {
    const subscription = Meteor.subscribe('games', gameId)
    let gameObject = GameCollection.findOne({_id: gameId})
    if (gameObject === undefined && subscription.ready()) {
        gameObject = startNewGame()
        gameObject.name = gameId;
        AddGameMessage(gameObject.name, "The game has started!")
        Meteor.call("upsertGame", gameId, gameObject)
    }
    return {
        gameObject: gameObject,
        isLoading: !subscription.ready(),
        gameId: gameId,
    }
}, [gameId])

export const GameView: React.FC = () => {
    let {gameId} = useParams();
    const {isLoading, gameObject} = useGame(gameId);
    const [clientPlayer, setClientPlayer] = React.useState<PlayerID | undefined>(undefined);
    const setGame = React.useCallback((game: Game) => {
        if (gameId)
            Meteor.call("upsertGame", gameId, game)
    }, [gameId])

    const playCard = React.useCallback((c: Card, p: PlayerID, tmpGame: Game) => {
        const game = cloneDeep(tmpGame);
        playCardInGame(game, c, p);
        setGame(game);
    }, [setGame])


    const startGame = React.useCallback((gameOptions: GameOptions, tmpGame: Game) => {
        const game = cloneDeep(tmpGame);
        if (gameOptions.alternativeDeck) {
            game.players.p1.discard = cloneDeep(startDeck);
            game.players.p2.discard = cloneDeep(startDeck);
        } else {
            game.players.p1.discard = cloneDeep(startDeckSplitDino);
            game.players.p2.discard = cloneDeep(startDeckSplitCat);
        }
        game.roundsToWin = gameOptions.rounds;
        game.players.p1.name = gameOptions.p1Name;
        game.players.p2.name = gameOptions.p2Name;
        drawPhase(game);
        setGame(game);
    }, [setGame])

    const onPurchase = React.useCallback((c: Card, p: PlayerID, tmpGame: Game) => {
        const game = cloneDeep(tmpGame);
        handlePurchase(game, c, p);
        setGame(game);
    }, [setGame])

    // calculate the size
    if (!isLoading) {
        if (gameObject) {
            return (
                <div className={"container"}>
                    <h1>Cattosaurus</h1>
                    {(!clientPlayer) ? (
                        <>
                            <p className={"mb-0"}><b>Select side:</b></p>
                            <ButtonGroup className={"mb-2"}>
                                <Button onClick={() => setClientPlayer("p1")}>
                                    {gameObject.players.p1.name}
                                </Button>
                                <Button onClick={() => setClientPlayer("p2")}>
                                    {gameObject.players.p2.name}
                                </Button>
                            </ButtonGroup>
                        </>
                    ) : null}
                    <GameComponent game={gameObject}
                                   startGame={(gameOptions) => startGame(gameOptions, gameObject)}
                                   playCard={(c, p) => playCard(c, p, gameObject)}
                                   purchaseCard={(c, p) => onPurchase(c, p, gameObject)}
                                   clientPlayer={clientPlayer}
                    />
                    <div className={"row d-flex justify-content-between"}>
                        <p className={"text-center mb-0"}>
                            <small>
                                v1.1.4
                            </small>
                        </p>
                        <a href={"https://globalgamejam.org/2022/games/cattosaurus-4"} className={"text-center"}>
                            More info
                        </a>
                    </div>
                </div>
            );
        } else {
            return <div>no game found!</div>
        }
    } else {
        return (
            <h1>LOADING</h1>
        )
    }
}
