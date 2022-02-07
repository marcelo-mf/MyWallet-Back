import dayjs from 'dayjs';
import joi from 'joi';
import db from '../db.js'
import dotenv from 'dotenv';
dotenv.config();



async function income(req, res) {
   
    try{

        const entrada = req.body;

        const entradaSchema = joi.object({
            value: joi.string().pattern(/^[0-9]+$/),
            description: joi.string().required(),
            token: joi.string().required()
        })
    
        const validation = entradaSchema.validate(entrada);
    
        if(validation.error) {
            res.sendStatus(422);
            return;
        }
    
        const value = parseInt(entrada.value);
        const date = dayjs().format('DD/MM'); 

        const session = await db.collection('sessions').findOne({token: entrada.token});
        console.log(entrada);
        console.log(session);
        const user = await db.collection('users').findOne({_id: session.userId});
        console.log(user)

        const list = {value: value, description: entrada.description, date: date, userId: user._id, type: 'entrada'}

        if(!user) {

            res.sendStatus(401);
            return;
        }

        await db.collection('list').insertOne(list)
        res.sendStatus(201);

    } catch {

        res.sendStatus(500);
    }
}

async function expense(req, res) {

    
    
    try{

        const saida = req.body;

        const saidaSchema = joi.object({
            value: joi.string().pattern(/^[0-9]/),
            description: joi.string().required(),
            token: joi.string().required()
        })
        
        const validation = saidaSchema.validate(saida);
        
        if(validation.error) {
            res.sendStatus(422);
            return;
        }
        
        const value = -parseInt(saida.value);
        const date = dayjs().format('DD/MM');

        const session = await db.collection('sessions').findOne({token: saida.token});
        console.log(saida);
        console.log(session);
        const user = await db.collection('users').findOne({_id: session.userId});
        console.log(user)
        console.log(value)

        const list = {value: value, description: saida.description, date: date, userId: user._id, type: 'saida'}
        console.log(list)

        if(!user) {

            res.sendStatus(401);
            return;
        }

        await db.collection('list').insertOne(list)
        res.sendStatus(201);

    } catch {

        res.sendStatus(500);
    }
}

const responses = {
    income, 
    expense
};

export default responses;