import { createHandler } from '@lilybird/handlers';
import { createClient, Intents } from 'lilybird';

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

const listeners = await createHandler({
    dirs: {
        slashCommands: `${import.meta.dir}/commands`,
        listeners: `${import.meta.dir}/listeners`
    }
});

const client = await createClient({
    token: process.env.TOKEN,
    intents: [
        Intents.GUILDS,
        Intents.GUILD_MESSAGES,

        // VVVVVVVVVV PRIVILEGED INTENTS VVVVVVVVVV
        // make sure to turn on these intent in your bot dev portal
        Intents.MESSAGE_CONTENT,
        Intents.GUILD_MEMBERS
    ],
    attachDebugListener: true,
    ...listeners
});

export default client;
