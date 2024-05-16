import { createAccount } from "@/lib/apiUtils/createAccount"
import { withSessionRoute } from "@/lib/apiUtils/session"
import jwt from 'jsonwebtoken'

const signupRoute = async (req, res) => {
  const { email, username, password } = req.body

  const newUser = {
    email,
    username,
    status: 'Active',
    role: 'Player',
  }

  const [_id, error] = await createAccount({
    ...newUser,
    password
  }, { confirmEmail: false }) // set this to true if its needed. Debug first.

  if (error) return res.send({ success: false, message: error })

  req.session.user = {
    _id,
    ...newUser,
    token: jwt.sign({ _id, role: newUser.role }, process.env.SECRET),
  }
  
  await req.session.save()
  
  res.send({ success: true })
}

export default withSessionRoute(signupRoute)