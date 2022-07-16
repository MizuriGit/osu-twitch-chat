import banchojs from 'bancho.js';
import tmijs from 'tmi.js';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join('.env') });
const env = process.env;

const tmiClient = new tmijs.Client({
    options: { debug: true },
    identity: {
        username: env.TWITCH_USERNAME,
        password: `oauth:${env.OAUTH_PASSWORD}`
    },
    channels: [env.TWITCH_USERNAME]
});

const banchoClient = new banchojs.BanchoClient({
    username: env.BANCHO_USERNAME,
    password: env.BANCHO_IRC_PASSWORD
});

(async () => {
    try {
        await tmiClient.connect();
        console.log('tmiClient connected...');
        tmiClient.say(env.TWITCH_USERNAME, 'Bot connected!');

        await banchoClient.connect();
        console.log('osu!bot connected...');
    } catch (err) {
        console.error(err.error);
    }

    const user = banchoClient.getUser(env.USER_ACCOUNT || env.BANCHO_USERNAME);

    tmiClient.on('message', async (_channel, tags, message) => {
        if (tags.username !== env.TWITCH_USERNAME) {
            await user.sendMessage(`${tags.username}: ${message}`);
        }
        banchoClient.on(
            'PM',
            async ({ message: osuMessage, user: osuUser }) => {
                if (osuUser.username !== env.BANCHO_USERNAME) {
                    await tmiClient.say(env.TWITCH_USERNAME, osuMessage);
                }
            }
        );
    });
})();
