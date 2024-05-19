import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next"

const sessionOptions = {
  cookieName: "monolith_auth",
  password: process.env.SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
}

export function withSessionRoute(handler) {
  return withIronSessionApiRoute(handler, sessionOptions)
}

export function withSessionSsr(handler) {
  return withIronSessionSsr(handler, sessionOptions)
}

export const verifyAuth = (req, res, roles) => {
  if (!req.session.user) {
    res.status(401).send({ error: 'Unauthorised' })
    return false
  }

  if (roles) {
    if (!roles.includes(req.session.user.role)) {
      res.status(403).send({ error: 'Forbidden' })
      return false
    }
  }

  return req.session.user
}