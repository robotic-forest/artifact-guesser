import { initDB } from "@/lib/apiUtils/mongodb"
import { verifyAuth, withSessionRoute } from "@/lib/apiUtils/session"
import moment from "moment";
import { ObjectId } from "mongodb"

async function editGame(req, res) {
  const user = verifyAuth(req, res); if (!user) return
  const db = await initDB()

  const { _id, ...data } = req.body
  if (!_id) throw new Error('You must provide an _id, you scoundrel!')

  const game = await db.collection('games').findOne({ _id: new ObjectId(_id) })
  if (game.userId !== user._id.toString()) return res.send({ success: false, error: 'You do not have permission to update this game' })

  // remove artifact so as not to save it within a game object
  const processedRounds = data.roundData.map(round => {
    const { artifact, ...rest } = round
    return rest
  })

  if (typeof data.startedAt === 'string') data.startedAt = moment(data.startedAt).toDate()

  if (data.newMode) {
    await db.collection('accounts').updateOne({ _id: new ObjectId(user._id) }, { $set: { currentMode: data.newMode } })
    delete data.newMode // Remove from game data after saving to account
  }

  // Prepare updates for the user's account document
  const accountUpdates = {};
  if (data.newMode !== undefined) {
    accountUpdates.currentMode = data.newMode;
    // Don't delete newMode from 'data' yet if it's needed for the game update below
  }
  // The frontend sends 'newTimer' in the settings object, which becomes 'selectedTimer' in the main 'data' object
  // Check for 'selectedTimer' in the main data object to update the account preference
  if (data.selectedTimer !== undefined) {
    // Save the timer preference to the user account.
    // Use null if the intention is to clear the preference.
    accountUpdates.currentTimer = data.selectedTimer;
  }

  // Apply updates to the account if there are any
  if (Object.keys(accountUpdates).length > 0) {
    await db.collection('accounts').updateOne({ _id: new ObjectId(user._id) }, { $set: accountUpdates });
  }

  // Update the game document (marks old game as non-ongoing, saves final state/settings)
  await db.collection('games').updateOne({ _id: new ObjectId(_id) }, { $set: { ...data, roundData: processedRounds } });
  res.send({ success: true });
}

export default withSessionRoute(editGame)
