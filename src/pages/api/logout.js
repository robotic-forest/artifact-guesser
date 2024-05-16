import { withSessionRoute } from "@/lib/session"

async function logoutRoute(req, res) {
  req.session.destroy()
  res.send({ success: true })
}

export default withSessionRoute(logoutRoute)