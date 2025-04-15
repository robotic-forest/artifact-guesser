# Artifact Guesser

Guess artifacts - date, location. WIP

## TODO

Prompts for future tasks:

socket backend code is in  in /home/tlaloc/projects/ptcx/protocodex-mainframe/artifact-guesser/socket.js which is the backend for multiplayer games

we need a way to track whether a player is in a multiplayer game. When in the route /multiplayer, you should be able to refresh the page and still be in the game. If however, you try to close the tab, or try to log out, we need a system confirm that asks them if they are sure, as it'll make them forfeit the game. If they are gone for more than 10 seconds, they get kicked, and forfeit the game.

Show a message to the other users right above the fixed chat showing a countdown: <user> has left. Kicking in <n>...

If they forfeit the game, and there is only one player left in the game, it needs to show them that they won, since the other person left the game, using the game summary but with modified text because of the forfeiture.

If a user leaves or refreshes /multiplayer before the 10 seconds are up, it doesnt show the lobby list like now, but automatically brings them back to the game, and the countdown is stopped.