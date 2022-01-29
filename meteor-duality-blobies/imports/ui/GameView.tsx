import React from "react";
import {useParams} from "react-router-dom";
import {useTracker} from 'meteor/react-meteor-data'
import {Game, GameCollection} from "/imports/data/game";

import {Meteor} from "meteor/meteor";
import {GameComponent} from "/imports/ui/GameComponent";
import {drawPhase, handlePurchase, playCardInGame, startNewGame} from "/imports/control/game-logic";
import {Card} from "/imports/data/card-data";
import {PlayerID} from "/imports/data/player";
import {cloneDeep, isEqual} from "lodash";

const useGame = (gameId: string = "") => useTracker(() => {
    const subscription = Meteor.subscribe('games', gameId)
    let gameObject = GameCollection.findOne({_id: gameId})
    if (gameObject === undefined && subscription.ready()) {
        console.log("new game")
        gameObject = startNewGame()
        gameObject.name = gameId;
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
    console.log("id", gameId);
    const {isLoading, gameObject} = useGame(gameId);

    const [tmpGame, setTMPGame] = React.useState(gameObject);

    if (!isEqual(gameObject, tmpGame)) {
        setTMPGame(gameObject);
    }

    const setGame = React.useCallback((game: Game) => {
        GameCollection.upsert({_id: gameId}, game)
        setTMPGame(game);
    }, [gameId])

    const playCard = React.useCallback((c: Card, p: PlayerID) => {
        if (!tmpGame) return;
        const game = cloneDeep(tmpGame);
        playCardInGame(game, c, p);
        setGame(game);
    }, [setGame, tmpGame])

    const toDrawState = React.useCallback(() => {
        if (!tmpGame) return;
        const game = cloneDeep(tmpGame);
        drawPhase(game);
        setGame(game);
    }, [setGame, tmpGame, setTMPGame])

    const onPurchase = React.useCallback((c: Card, p: PlayerID) => {
        if (!tmpGame) return;
        const game = cloneDeep(tmpGame);
        handlePurchase(game, c, p);
        setGame(game);
    }, [setGame, tmpGame])


    if (!isLoading) {
        if (gameObject && tmpGame) {
            return (
                <div className={"container-fluid"}>
                    <h1>Doality Blobies</h1>
                    <GameComponent game={tmpGame} toDrawState={toDrawState} playCard={playCard}
                                   purchaseCard={onPurchase}/>
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
