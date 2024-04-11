const express = require('express');
const app = express();
app.use(express.json());

let messageCount = 0;
const rateLimit = (req, res, next) => {
    if (messageCount < 5) {
        messageCount++;
        next();
    } else {
        return res.status(429).send({ message: "Too Many Requests" });
    }
};

app.post('/messages', rateLimit, (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).send({ message: "Bad Request" });
    }
    console.log(text);
    res.status(200).send({ message: "Message received loud and clear" });
});

app.listen(3000, () => {
    console.log('Server for messages API is running on port 3000');
});
