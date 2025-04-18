import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"

const games = async (req, res) => {
  const v = verifyAuth(req, res); if (!v) return
  const db = await initDB()

  const gamesCollection = db.collection('games');

  // Use aggregation pipeline to get counts and mode breakdown
  const statsPipeline = [
    {
      $facet: {
        // Count total, single, and multi player games
        counts: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              multiplayerGames: {
                $sum: {
                  $cond: [{ $eq: ["$gameType", "multiplayer"] }, 1, 0]
                }
              },
              singlePlayerGames: {
                 $sum: {
                  $cond: [{ $ne: ["$gameType", "multiplayer"] }, 1, 0]
                }
              }
            }
          }
        ],
        // Group by mode and count
        modeCounts: [
          // Restore $match stage and use correct field 'mode'
          {
            $match: { "mode": { $exists: true, $ne: null } } // Ensure mode exists and is not null
          },
          {
            $group: {
              // Group by the top-level 'mode' field
              _id: "$mode",
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0, // Exclude the default _id field
              mode: "$_id", // Rename _id to mode
              count: 1
            }
          }
        ]
      }
    }
  ];

  let results;
  try {
    results = await gamesCollection.aggregate(statsPipeline).toArray();
  } catch (error) {
    console.error("API Error: Failed during aggregation:", error);
    return res.status(500).send({ error: "Failed to fetch game statistics from database." });
  }

  // Process the results more robustly
  const aggregationResult = results?.[0]; // Get the first element from the aggregation result array

  const countsData = aggregationResult?.counts?.[0] || { total: 0, singlePlayerGames: 0, multiplayerGames: 0 };
  const modeCountsArray = aggregationResult?.modeCounts || [];

  // Convert modeCounts array to an object { modeName: count }
  const modeCountsObject = modeCountsArray.reduce((acc, item) => {
    // Ensure item and item.mode are valid before assignment
    if (item && item.mode) {
      acc[item.mode] = item.count;
    } // <-- Added missing closing brace here
    return acc;
  }, {});

  const responseData = {
    data: {
      total: countsData.total,
      singlePlayerGames: countsData.singlePlayerGames,
      multiplayerGames: countsData.multiplayerGames,
      modeCounts: modeCountsObject, // Add mode counts to the response
    },
  };

  res.send(responseData);
}

export default withSessionRoute(games)
