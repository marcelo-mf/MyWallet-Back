import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
import db from '../db.js'
import dotenv from 'dotenv';
dotenv.config();


export default async function signIn(req, res) {

    const user = req.body;

    const userSchema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().required()
    })

    const validation = userSchema.validate(user);

    if(validation.error) {
        res.sendStatus(422);
        return;
    }

    try{

        const selectedUser = await db.collection('users').findOne({ email: user.email });

        if(!selectedUser){
            res.sendStatus(401);
            return;
        }

        const isAuthorized = bcrypt.compareSync(user.password, selectedUser.password);

        if(!isAuthorized) {
            res.sendStatus(401)
            return;
        }

        const token = uuid();

        await db.collection('sessions').insertOne({token, userId: selectedUser._id})

        res.send({token: token, name: selectedUser.name});

    } catch {
        res.sendStatus(500);
    }

}