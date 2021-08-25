import express, { Response } from 'express'
import { db } from './MongoDB'

export const router = express.Router()

router.get('/add', async (req, res): Promise<Response> => {
  const channelId = req.query.channelId.toString()
  try {
    await db.add({ channelId });
    return res.send(`Channel ID: ${channelId} added`)
  } catch(e) {
    throw new Error(`Can't add channel: ${e}`)
  }
})

router.get('/list', async (_, res): Promise<Response> => {
  const channels = await db.getAll()
  let list = ''
  channels.forEach(({ channelTitle, channelLink, channelId}) => {
    const channelData = `<p>Title: ${channelTitle}</p>` + 
                        `<p>ID: ${channelId}</p>` + 
                        `<p>Link: ${channelLink}</p><hr>`
    list += channelData
  })
  return res.send(list)
})

router.get('/delete', async (req, res): Promise<Response> => {
  const channelId = req.query.channelId.toString()
  try {
    await db.delete(channelId);
    return res.send(`Channel ID: ${channelId} deleted`)
  } catch(e) {
    throw new Error(`Can't add channel: ${e}`)
  }
})