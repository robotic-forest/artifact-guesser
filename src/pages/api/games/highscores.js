import { initDB } from "@/lib/apiUtils/mongodb";
import { ObjectId } from "mongodb";

const highscores = async (req, res) => {
  const db = await initDB();
  const { mode, timer, rounds } = req.query;

  // Base match for non-timer query parameters
  const baseMatch = {};
  if (mode) baseMatch.mode = mode;
  // Timer will be handled separately within facets due to different field names
  if (rounds) {
    const roundsNum = parseInt(rounds, 10);
    baseMatch.rounds = isNaN(roundsNum) ? rounds : roundsNum;
  }

  // Prepare timer value if provided
  let timerValue = null;
  if (timer) {
    const timerNum = parseInt(timer, 10);
    timerValue = isNaN(timerNum) ? timer : timerNum;
  }

  try {
    // Build match conditions dynamically for facets
    const singlePlayerMatch = {
      ...baseMatch,
      score: { $exists: true, $ne: null },
      gameType: { $ne: 'multiplayer' } // Explicitly exclude multiplayer or assume non-multiplayer are single
    };
    if (timerValue !== null) {
      singlePlayerMatch.selectedTimer = timerValue; // Use selectedTimer for single player
    }

    const multiPlayerMatch = {
      ...baseMatch,
      gameType: 'multiplayer',
      finalScores: { $exists: true, $ne: null, $ne: [] }
    };
    if (timerValue !== null) {
      multiPlayerMatch.timer = timerValue; // Use timer for multiplayer
    }

    const highscorePipeline = [
      {
        $facet: {
          singlePlayer: [
            { $match: singlePlayerMatch },
            { $project: { _id: 0, userId: 1, score: 1, mode: 1, timer: "$selectedTimer", rounds: 1, gameType: { $ifNull: ['$gameType', 'single'] } } } // Project selectedTimer as timer
          ],
          multiPlayer: [
            { $match: multiPlayerMatch },
            { $unwind: "$finalScores" },
            { $project: {
                _id: 0,
                userId: "$finalScores.userId",
                score: "$finalScores.totalScore",
                mode: 1,
                timer: 1, // Multiplayer uses 'timer' field directly
                rounds: 1,
                gameType: 1
              }
            }
          ]
        }
      },
      {
        $project: {
          allScores: { $concatArrays: ["$singlePlayer", "$multiPlayer"] }
        }
      },
      { $unwind: "$allScores" },
      { $replaceRoot: { newRoot: "$allScores" } },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ];

    const topScores = await db.collection('games').aggregate(highscorePipeline).toArray();

    if (topScores.length === 0) {
      res.send([]);
      return;
    }

    // Fetch associated user data
    const userIds = topScores.map(scoreEntry => {
      try {
        // Ensure userId is a valid ObjectId before mapping
        // userId might already be an ObjectId if coming from single-player,
        // or a string if coming from multiplayer finalScores. Handle both.
        if (scoreEntry.userId instanceof ObjectId) {
          return scoreEntry.userId;
        }
        return new ObjectId(scoreEntry.userId);
      } catch (e) {
        console.error(`Invalid userId format found: ${scoreEntry.userId}`);
        return null; // Skip invalid IDs
      }
    }).filter(id => id !== null); // Filter out any nulls from invalid IDs

    // Ensure uniqueness in case a user appears multiple times in top scores
    const uniqueUserIds = [...new Set(userIds.map(id => id.toString()))].map(idStr => new ObjectId(idStr));

    const users = await db.collection('accounts').find({ _id: { $in: uniqueUserIds } }).toArray();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.username;
      return acc;
    }, {});

    // Combine score data with usernames
    const scoresWithUsernames = topScores.map(scoreEntry => ({
      ...scoreEntry,
      // Ensure userId is consistently a string for the final output if needed,
      // or keep as ObjectId if preferred by frontend. Let's convert to string for safety.
      userId: scoreEntry.userId.toString(),
      username: userMap[scoreEntry.userId.toString()] || 'Unknown User' // Handle cases where user might not be found
    }));

    res.send(scoresWithUsernames);
  } catch (error) {
    console.error("Error fetching highscores:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default highscores;
