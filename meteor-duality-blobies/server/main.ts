import {Meteor} from 'meteor/meteor';
import {GameCollection} from "/imports/data/game";
import {ChatCollection} from "/imports/data/chat";
import {PlayerID} from "/imports/data/player";
import {doMigrations} from "/server/migrations";


Meteor.startup(() => {
    doMigrations();
});

Meteor.publish('games', function (gameId: string) {
    return GameCollection.find({_id: gameId})
});

Meteor.publish('all-games', function () {
    return GameCollection.find({})
});

Meteor.publish('chat', function (gameId: string) {
    return ChatCollection.find({_id: gameId})
});

Meteor.methods({
    upsertGame(gameId, game) {
        GameCollection.upsert(gameId, game)
    },

    upsertChatMessage(gameId: string, message: string, playerId: PlayerID) {
        ChatCollection.upsert(gameId, {
            $push: {
                messages: {
                    message: message,
                    playerId: playerId ? playerId : undefined,
                    timestamp: new Date(),
                },
            },
        })
    },

    upsertGameMessage(gameId: string, message: string) {
        ChatCollection.upsert(gameId, {
            $push: {
                messages: {
                    message: message,
                    timestamp: new Date(),
                },
            },
        })
    },
});
