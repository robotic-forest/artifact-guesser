# Artifact Guesser

Guess artifacts - date, location. WIP

## TODO

Prompts for future tasks:

ok, we just added a new schema for saved multiplayer games. Now, we need to update the backend logic to create a game object on start of the game, and track its progress, just like logged-in single-player games. Take a look at how those are implemented, and replicate what makes sense for multip-layer games.

A previous run already added the comment:
// --- Create Game Record in DB ---
and
// --- Save Round Data to DB ---
and corresponding code for each in /home/tlaloc/projects/ptcx/protocodex-mainframe/artifact-guesser/socket.js which is the backend for multiplayer games

we need a way to track whether a player is in a multiplayer game. When in the route /multiplayer, you should be able to refresh the page and still be in the game. If however, you try to close the tab, or try to log out, we need a system confirm that asks them if they are sure, as it'll make them forfeit the game. If they forfeit the game, and there is only one player left in the game, it needs to show them that they won, since the other person left the game. that screen should be fullscreen, basically the game summary but with modified text because of the forfeiture.