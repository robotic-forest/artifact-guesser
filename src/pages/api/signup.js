import { createAccount } from "@/lib/apiUtils/createAccount"
import { initDB } from "@/lib/apiUtils/mongodb"
import { withSessionRoute } from "@/lib/apiUtils/session"
import jwt from 'jsonwebtoken'
import moment from "moment"

const signupRoute = async (req, res) => {
  const db = await initDB()
  const { email, username, password, game, anonymousId } = req.body

  const newUser = {
    email,
    username,
    status: 'Active',
    role: 'Player',
    ...(anonymousId && { anonymousId }),
  }

  const [_id, error] = await createAccount({
    ...newUser,
    password
  }, { confirmEmail: false }) // set this to true if its needed. Debug first.

  if (error) return res.send({ success: false, message: error })

  // save game
  if (game) {
    const processedRounds = game.roundData.map(round => {
      const { artifact, ...rest } = round
      return rest
    })

    const newGame = {
      ...game,
      roundData: processedRounds,
      userId: _id.toString(),
      ongoing: true,
      startedAt: moment(game.startedAt).toDate()
    }

    await db.collection('games').insertOne(newGame)
  }

  req.session.user = {
    _id,
    ...newUser,
    token: jwt.sign({ _id, role: newUser.role }, process.env.SECRET),
  }
  
  await req.session.save()

  // Link anonymous identity to the new account for journey tracking
  if (anonymousId) {
    await db.collection('analyticsEvents').insertOne({
      type: 'identity_linked',
      occurredAt: new Date(),
      source: 'internal',
      anonymousId,
      userId: _id.toString(),
      path: '/api/signup',
    })
  }

  res.send({ success: true })
}

export default withSessionRoute(signupRoute)