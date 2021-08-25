import mongoose, { Mongoose, ObjectId } from "mongoose";

const dbUrl = process.env.MONGO_DB_URL

export interface YouTubeChannel {
  _id?: ObjectId
  channelTitle?: string
  channelLink?: string
  channelId : string
  feedUrl?: string,
  pubDate?: string
  __v?: number
}

interface Query {
  [key: string]: string
}

interface UpdateChannel {
  channelId: string
  query: Query
}

const ChannelSchema = new mongoose.Schema<YouTubeChannel>({
  channelTitle: String,
  channelLink: String,
  channelId: String,
  feedUrl: String,
  pubDate: String
})

const Channel = mongoose.model('Channel', ChannelSchema);

export class DB {
  private mongoose: Mongoose
  private url: string

  constructor(url: string) {
    this.mongoose = mongoose
    this.url = url
    this.start()
  }

  async add({ channelTitle = '', channelLink = '', channelId, feedUrl = '', pubDate = '' }: YouTubeChannel): Promise<void> {
    const channelExist = await this.find(channelId)
    if (channelExist) {
      console.log(`Channel ID: ${channelId} already exist`)
    } else {
      const channel = new Channel({
        channelTitle,
        channelLink,
        channelId,
        feedUrl,
        pubDate
      })
      channel.save();
    }
  }

  async update({ channelId, query }: UpdateChannel): Promise<void> {
    try {
      await Channel.updateOne({ channelId }, query);
    } catch(e) {
      throw new Error(`Cannot update channel: ${e}`);
    }
  }

  async find(channelId: string): Promise<YouTubeChannel> {
    try {
      return await Channel.findOne({ channelId });
    } catch(e) {
      throw new Error(`Cannot find channel: ${e}`);
    }
  }
 
  async delete(channelId: string): Promise<void> {
    try {
      await Channel.deleteOne({ channelId });
    } catch(e) {
      throw new Error(`Cannot delete channel: ${e}`);
    }
  }

  async getAll(): Promise<YouTubeChannel[]> {
    try {
      return await Channel.find({});
    } catch(e) {
      throw new Error(`Cannot get channels: ${e}`);
    }
  }

  async start(): Promise<void> {
    await this.mongoose.connect(this.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    })
    console.log('Connected successfully to server');
  }
}

export const db = new DB(dbUrl);