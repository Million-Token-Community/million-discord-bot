import { Message } from "discord.js";
import { IMessageHandler } from "./IMessageHandler";
import { channelIds } from '../config';

export class SuggestionsBox implements IMessageHandler {
    
    private channel_id = channelIds.suggestion_box;


    handle(message: Message): void 
    {

        try
        {
            if (message.channel.id == this.channel_id) 
            {
                message.react('✅')
                message.react('❌')
            }
        }
        catch (err) {console.log('Error in SuggestionsBox: ' + err)}
    }
}