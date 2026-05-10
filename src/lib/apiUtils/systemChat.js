import axios from "axios"

const MAINFRAME_URL = process.env.MAINFRAME_URL || 'https://api.protocodex.com'

/**
 * POSTs a system chat message to the mainframe's /ag/system-chat webhook,
 * which inserts it into chat_messages and emits to the global chat room.
 * No-ops cleanly if the webhook secret isn't configured.
 */
export const postSystemChat = async (message) => {
  if (!process.env.AG_WEBHOOK_SECRET) return
  if (!message) return
  try {
    await axios.post(
      `${MAINFRAME_URL}/ag/system-chat`,
      { message },
      {
        headers: { 'x-ag-secret': process.env.AG_WEBHOOK_SECRET },
        timeout: 4000,
      },
    )
  } catch (err) {
    // Fire-and-forget — never let chat broadcast failures bubble.
    console.warn('[systemChat] Failed to broadcast:', err?.message)
  }
}
