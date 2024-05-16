import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { initDB } from "@/lib/apiUtils/mongodb"
import { getUser } from '@/lib/utils'
import { serverError } from '@/lib/apiUtils/misc'
import { withSessionRoute } from '@/lib/apiUtils/session'

async function loginRoute(req, res) {
  const db = await initDB()
  const existingSession = await getUser(req)
  
  try {
    const { email: formEmail, password: formPassword } = req.body
    let user = await db.collection('accounts').findOne({ email: { $regex: new RegExp(`^${formEmail}$`, 'i') } })
    
    if (!existingSession || !existingSession?.role === 'admin') {
      if (user && !user.password) {
        res.send({
          success: false,
          message: 'You have not yet set up a password.'
        })
        return
      }
      
      if ((!user || !bcrypt.compareSync(formPassword, user.password))) {
        res.send({
          success: false,
          message: 'The email or password you entered is incorrect. Please try again.'
        })
        return
      }
  
      if (user.status === 'deactivated') {
        res.send({
          success: false,
          message: 'Your account has been deactivated.'
        })
        return
      }
    }
    
    const { password, ...userData } = user
    
    req.session.user = {
      ...userData,
      token: jwt.sign({ _id: userData._id, role: userData.role }, process.env.SECRET),
    }
    
    await req.session.save()
    
    res.send({
      success: true,
      role: userData.role
    })
  } catch(error) { serverError(error, res) }
}

export default withSessionRoute(loginRoute)