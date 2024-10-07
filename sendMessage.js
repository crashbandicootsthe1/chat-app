// netlify/functions/sendMessage.js
const Pusher = require('pusher');
const bodyParser = require('body-parser');

const pusher = new Pusher({
    appId: process.env.APPID,
    key: process.env.KEY,
    secret: process.env.SECRET,
    cluster: process.env.CLUSTER,
    useTLS: true
});

exports.handler = async (event, context) => {
    if (event.httpMethod === 'POST') {
        const data = JSON.parse(event.body);
        await pusher.trigger('chat-channel', 'message-sent', {
            nickname: data.nickname,
            message: data.message,
            timestamp: data.timestamp
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Message sent' })
        };
    }
    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
