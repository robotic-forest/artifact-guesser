import { cleanMDB, processCriteria } from "@/lib/apiUtils/misc";
import { initDB } from "@/lib/apiUtils/mongodb";
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session";
import { ObjectId } from "mongodb";

/* 
Single Player Schema: {
  _id: ObjectId
  userId: string // ID of the player
  ongoing: boolean
  round: number
  rounds: number
  score: number // Final score for the player
  mode: string // Game mode (e.g., 'classic')
  startedAt: Date
}

Multiplayer Schema: {
  _id: ObjectId,
  gameType: 'multiplayer', // Distinguishes game types.
  hostId: string,          // User ID of the game host.
  playerIds: [string],     // Array of participating user IDs.
  ongoing: boolean,        // Is the game in progress?
  rounds: number,          // Total number of rounds in the game.
  mode: string,            // Game mode (e.g., 'Classic').
  startedAt: Date,         // Timestamp game started.
  endedAt: Date,           // Timestamp game ended (set when ongoing: false).
  winnerId: string,        // User ID of the winner (null if ongoing or tie).
  roundData: [             // Modified structure
    {
      round: number,         // Round number.
      artifactId: string,    // Artifact ID for the round.
      playerGuesses: [       // Stores each player's guess and score for this round.
        {
          userId: string,
          selectedDate: number,
          selectedCountry: string,
          datePoints: number,
          countryPoints: number,
          points: number,      // Score for this player in this round.
          guessedAt: Date      // Timestamp of the guess.
        }
      ]
    }
  ],
  finalScores: [             // Stores the final aggregated score for each player.
    {
      userId: string,
      totalScore: number
    }
  ]
} 
*/

const games = async (req, res) => {
  const user = verifyAuth(req, res); if (!user) return;
  const db = await initDB();

  const criteria = req.query.filter && processCriteria(JSON.parse(req.query.filter));
  const page = parseFloat(req.query.page) || 1;
  const perPage = parseFloat(req.query.per_page) || 0;
  const sort = req.query.sort && JSON.parse(req.query.sort);

  const dbGames = await db
    .collection("games")
    .find(criteria || {}) // Ensure criteria is an object even if undefined
    .collation({ locale: "en" }) // sort case insensitive
    .sort(sort || { startedAt: -1 }) // Default sort if none provided
    .skip((page - 1) * perPage) // pagination
    .limit(perPage)
    .toArray();

  // Collect all user IDs needed from all games (single and multi)
  const allUserIds = new Set();
  dbGames.forEach(g => {
    if (g.gameType === 'multiplayer') {
      g.playerIds?.forEach(id => allUserIds.add(new ObjectId(id)));
      if (g.winnerId) allUserIds.add(new ObjectId(g.winnerId));
      if (g.hostId) allUserIds.add(new ObjectId(g.hostId));
    } else {
      // Assume single player if gameType is not 'multiplayer'
      if (g.userId) allUserIds.add(new ObjectId(g.userId));
    }
  });

  const users = await db
    .collection("accounts")
    .find({ _id: { $in: Array.from(allUserIds) } })
    .project({ username: 1 }) // Only fetch username
    .toArray();

  const userMap = users.reduce((acc, u) => {
    acc[u._id.toString()] = u.username || "N/A";
    return acc;
  }, {});

  const processedGames = dbGames.map(g => {
    const gameType = g.gameType || 'single'; // Default to single player
    let players = [];
    let winnerUsername = null;
    let topScore = null;
    let averageScore = null;
    let allScoresTooltip = null;

    if (gameType === 'multiplayer') {
      players = g.playerIds?.map(id => userMap[id] || 'Unknown') || [];
      winnerUsername = g.winnerId ? userMap[g.winnerId] || 'Unknown' : null;

      if (g.finalScores && g.finalScores.length > 0) {
        const scores = g.finalScores.map(s => s.totalScore);
        topScore = Math.max(...scores);
        averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
        allScoresTooltip = g.finalScores
          .map(s => `${userMap[s.userId] || 'Unknown'}: ${s.totalScore}`)
          .join(' - ');
      }
    } else {
      // Single player
      players = [userMap[g.userId] || 'N/A'];
      // Keep existing score field for single player
      topScore = g.score; // Use existing score field for consistency in sorting/display if needed
    }

    return {
      ...g,
      gameType,
      players, // Array of usernames
      winnerUsername,
      topScore,
      averageScore,
      allScoresTooltip,
      // Ensure userId is still present for potential backward compatibility or specific single-player logic
      username: gameType === 'single' ? players[0] : undefined, 
    };
  });

  res.send({
    data: cleanMDB(processedGames),
    total: await db.collection("games").countDocuments(criteria || {}),
  });
};

export default withSessionRoute(games);
