import cors from 'cors';
import express from 'express';
import contentRouter from './src/routes/contentRouter.js';
import authRouter from './src/routes/authRouter.js';

const server = express();
server.use(cors());
server.use(express.json());

server.use(contentRouter);
server.use(authRouter);

server.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
