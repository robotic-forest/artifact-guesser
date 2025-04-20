import { initDB } from "@/lib/apiUtils/mongodb";
import { ObjectId } from "mongodb";

const highscores = async (req, res) => {
  const db = await initDB();
  const { mode, timer, rounds } = req.query;

  // Build the filter object based on provided query parameters
  const filter = {};
  if (mode) {
    filter.mode = mode; // Assuming mode is stored as a string
  }
  if (timer) {
    // Attempt to parse timer as an integer, default to original string if NaN
    const timerNum = parseInt(timer, 10);
    filter.timer = isNaN(timerNum) ? timer : timerNum;
  }
  if (rounds) {
    // Attempt to parse rounds as an integer, default to original string if NaN
    const roundsNum = parseInt(rounds, 10);
    filter.rounds = isNaN(roundsNum) ? rounds : roundsNum;
  }

  // Add a filter to only include games that have a score (i.e., completed games)
  filter.score = { $exists: true, $ne: null };

  try {
    const dbGames = await db.collection('games')
      .find(filter)
      .sort({ score: -1 })
      .limit(10)
      .toArray();

    if (dbGames.length === 0) {
      res.send([]);
      return;
    }

    // Fetch associated user data
    const userIds = dbGames.map(g => {
      try {
        // Ensure userId is a valid ObjectId before mapping
        return new ObjectId(g.userId);
      } catch (e) {
        console.error(`Invalid userId format found: ${g.userId}, gameId: ${g._id}`);
        return null; // Skip invalid IDs
      }
    }).filter(id => id !== null); // Filter out any nulls from invalid IDs

    const users = await db.collection('accounts').find({ _id: { $in: userIds } }).toArray();
    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user.username;
      return acc;
    }, {});

    // Combine game data with usernames
    const gamesWithUsernames = dbGames.map(g => ({
      ...g,
      username: userMap[g.userId] || 'Unknown User' // Handle cases where user might not be found
    }));

    res.send(gamesWithUsernames);
  } catch (error) {
    console.error("Error fetching highscores:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export default highscores;
