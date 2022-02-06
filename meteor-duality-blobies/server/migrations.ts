import {GameCollection} from "/imports/data/game";
// @ts-ignore
import {Migrations} from 'meteor/percolate:migrations';

export function doMigrations() {
    Migrations.add({
        version: 1,
        name: "add round effect to game",
        up() {
            GameCollection.find({roundEffects: {$exists: false}}).forEach(game => {
                if (game._id) {
                    GameCollection.update(game._id, {$set: {roundEffects: []}})
                }
            })
        },
        down() {
            GameCollection.update({}, {$unset: {roundEffects: true}}, {multi: true})
        },
    });
    Migrations.add({
        version: 2,
        name: "add round limit to game",
        up() {
            GameCollection.find({roundsToWin: {$exists: false}}).forEach(game => {
                if (game._id) {
                    GameCollection.update(game._id, {$set: {roundsToWin: 12}})
                }
            })
        },
        down() {
            GameCollection.update({}, {$unset: {roundsToWin: true}}, {multi: true})
        },
    });
    Migrations.migrateTo('latest');
}
