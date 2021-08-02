import { Message } from "discord.js";
import { IMessageHandler } from "./IMessageHandler";
import {channelIds} from '../channel-IDs'

export class SuggestionsBox implements IMessageHandler {
    
    private channel_id = channelIds.suggestion_box;


    handle(message: Message): void 
    {

        try
        {
            console.log(message.channel.id, this.channel_id)
            if (message.channel.id == this.channel_id) 
            {
                message.react('✅')
                message.react('❌')
            }
        }
        catch (err) {console.log('Error in SuggestionsBox: ' + err)}
    }
}