import React from "react";
import {useParams} from "react-router-dom";
import {useTracker} from 'meteor/react-meteor-data'
import {Game, GameCollection} from "/imports/data/game";

import {Meteor} from "meteor/meteor";
import {GameComponent} from "/imports/ui/GameComponent";
import {drawPhase, handlePurchase, playCardInGame, startNewGame} from "/imports/control/game-logic";
import {Card} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {cloneDeep} from "lodash";
import {Button} from "react-bootstrap";
import {AddGameMessage} from "/imports/data/chat";

const useGame = (gameId: string = "") => useTracker(() => {
    const subscription = Meteor.subscribe('games', gameId)
    let gameObject = GameCollection.findOne({_id: gameId})
    if (gameObject === undefined && subscription.ready()) {
        gameObject = startNewGame()
        gameObject.name = gameId;
        AddGameMessage(gameObject.name, "The game has started!")
        GameCollection.upsert({_id: gameId}, gameObject)
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
        GameCollection.upsert({_id: gameId}, game)
    }, [gameId])

    const playCard = React.useCallback((c: Card, p: PlayerID, tmpGame: Game) => {
        const game = cloneDeep(tmpGame);
        playCardInGame(game, c, p);
        setGame(game);
    }, [setGame])

    const toDrawState = React.useCallback((tmpGame: Game) => {
        const game = cloneDeep(tmpGame);
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
                        <><p><b>Select side:</b></p>
                            <Button onClick={() => setClientPlayer("p1")}>
                                Player 1
                            </Button>
                            <Button onClick={() => setClientPlayer("p2")}>
                                Player 2
                            </Button>
                        </>
                    ) : null}
                    <GameComponent game={gameObject}
                                   toDrawState={() => toDrawState(gameObject)}
                                   playCard={(c, p) => playCard(c, p, gameObject)}
                                   purchaseCard={(c, p) => onPurchase(c, p, gameObject)}
                                   clientPlayer={clientPlayer}
                    />
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
