import React from 'react';
import {useTracker} from "meteor/react-meteor-data";
import {Meteor} from "meteor/meteor";
import {GameCollection} from "/imports/data/game";


const randomString = (len: number) => {
    const letters = "ABCDEFHJKMPRSTU2345789";
    let result = ""
    while (result.length < len) {
        result += letters[Math.floor(Math.random() * letters.length)];
    }
    return result;
}

const useGame = () => useTracker(() => {
    const subscription = Meteor.subscribe('all-games')
    let games = GameCollection.find({}).fetch()

    return {
        games: games,
        isLoading: !subscription.ready()
    }
})

export const App = () => {

    const {isLoading, games} = useGame();

    const [code] = React.useState(randomString(6));


    if(!isLoading) {
        return (
            <div className={"container-fluid"}>
                <h1>Start new game</h1>
                <a className={"btn btn-primary"} href={"/game/" + code} role={"button"}>Start game {code}</a>
                <h1>Join game</h1>
                <ul className="list-group list-group-flush">
                {games.map((game) =>
                    <li className="list-group-item"><a className={"btn btn-primary"} href={"/game/" + game.name} role={"button"}>{game.name}</a></li>
                )}
                </ul>
            </div>
        );
    }
    else
        return "loading..."
};
