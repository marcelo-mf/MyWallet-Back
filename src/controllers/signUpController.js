import bcrypt from 'bcrypt';
import joi from 'joi';
import db from '../db.js'
import dotenv from 'dotenv';
dotenv.config();



export default async function signUp (req, res) {

    const user = {name: req.body.name, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10)};

    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required(),
        password: joi.string().required()
    })

    const validation = userSchema.validate(user);

    if(validation.error || req.body.password !== req.body.confirmPassword) {
        res.sendStatus(422);
        return;
    }

    try{

        const userExists = await db.collection('users').findOne({email: user.email});

        if(userExists){
            res.sendStatus(409);
            return;
        }

        await db.collection('users').insertOne(user);
        res.sendStatus(201);
        
    } catch {
        res.sendStatus(500);
    }

}