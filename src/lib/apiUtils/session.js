import { getIronSession } from "iron-session"

const sessionOptions = {
  cookieName: "monolith_auth",
  password: process.env.SESSION_PASSWORD,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
}

export function withSessionRoute(handler) {
  return async function sessionRoute(req, res) {
    req.session = await getIronSession(req, res, sessionOptions)
    return handler(req, res)
  }
}

export function withSessionSsr(handler) {
  return async function sessionSsr(context) {
    context.req.session = await getIronSession(context.req, context.res, sessionOptions)
    return handler(context)
  }
}

export const verifyAuth = (req, res, roles) => {
  if (!req.session.user) {
    if (res) res.status(401).send({ error: 'Unauthorised' })
    return false
  }

  if (roles) {
    if (!roles.includes(req.session.user.role)) {
      if (res) res.status(403).send({ error: 'Forbidden' })
      return false
    }
  }

  return req.session.user
}
