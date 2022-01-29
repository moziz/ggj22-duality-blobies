import React, {useState} from "react";
import { useParams } from "react-router-dom";
import { useTracker } from 'meteor/react-meteor-data'
import {GameCollection} from "/imports/data/game";

import { Meteor } from "meteor/meteor";
import {GameComponent} from "/imports/ui/GameComponent";
import {startNewGame} from "/imports/control/game-logic";

const useGame = (gameId:string = "") => useTracker(() => {
    const subscription = Meteor.subscribe('games', gameId)
    let gameObject = GameCollection.findOne({ _id: gameId })
    if(gameObject === undefined) {
        gameObject = startNewGame()
        gameObject.name = gameId;
        GameCollection.upsert({_id: gameId}, gameObject)
    }
    return {
        gameObject: gameObject,
        isLoading: !subscription.ready(),
        gameId: gameId
    }
}, [gameId])

export const GameView: React.FC = () => {

    let { gameId } = useParams();
    const { isLoading, gameObject } = useGame(gameId)

    if(!isLoading) {
        if(gameObject != undefined) {
            return (
                <GameComponent game={gameObject} / >
            );
        }
        else {
            return <div>no game found</div>
        }
    }
    else {
        return (
            <h1>LOADING</h1>
        )
    }
}
