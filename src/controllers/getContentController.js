import dotenv from 'dotenv';
import db from '../db.js'
dotenv.config();



export default async function getList(req, res) {

    try{

        const authorization = req.headers.authorization;
        const token = authorization?.replace('Bearer ', '');

        if(!token) {
            res.sendStatus(401);
            return;
        }

        const session = await db.collection('sessions').findOne({token: token});

        if(!session) {
            res.sendStatus(401);
            return;
        }

        const user = await db.collection('users').findOne({_id: session.userId});       
        const list = await db.collection('list').find({userId: user._id}).toArray();

        if(user) {

            res.send(list);
            res.sendStatus(201);

        } else {

            res.sendStatus(401);

        }

    } catch {

        res.sendStatus(500);
    }

}