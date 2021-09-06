import {
  CommandOptionType,
  ApplicationCommandOption
} from 'slash-create';

export const commandOptions: ApplicationCommandOption[] = [
  {
    type: CommandOptionType.SUB_COMMAND,
    name: 'list',
    description: 'View all current message name and IDs, or if an ID is provided, a detailed single message.',
    options: [
      {
        type: CommandOptionType.STRING,
        name: 'shill_id',
        description: 'Shill ID',
        required: false
      }
    ]
  },

  {
    type: CommandOptionType.SUB_COMMAND,
    name: 'create',
    description: 'Creates a new message.',
    options: [
      {
        type: CommandOptionType.STRING,
        name: 'name',
        description: 'Name of new message',
        required: true
      },
      {
        type: CommandOptionType.STRING,
        name: 'message_id',
        description: 'The ID of the message used in chat. Message must be in #bot-commands.',
        required: true
      },
    ]
  },

  {
    type: CommandOptionType.SUB_COMMAND,
    name: 'edit',
    description: 'Edits a message',
    options: [
      {
        type: CommandOptionType.STRING,
        name: 'shill_id',
        description: 'Shill ID',
        required: true
      },
      {
        type: CommandOptionType.STRING,
        name: 'name',
        description: 'Name of message',
      },
      {
        type: CommandOptionType.STRING,
        name: 'message_id',
        description: 'The ID of the message used in chat. Message must be in #bot-commands.',
      },
    ]
  },

  {
    type: CommandOptionType.SUB_COMMAND,
    name: 'delete',
    description: 'Deletes a message.',
    options: [
      {
        type: CommandOptionType.STRING,
        name: 'shill_id',
        description: 'Shill message ID',
        required: true
      },
    ]
  },

  {
    type: CommandOptionType.SUB_COMMAND,
    name: 'update_cache',
    description: 'Updates message cache to apply shill message changes immediately.',
  },
]