import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { MongoClient } from 'mongodb';
import { v4 as uuid } from 'uuid';
import joi from 'joi';
dotenv.config();

const server = express();
server.use(cors());
server.use(express.json());

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;

mongoClient.connect(() => {
    db = mongoClient.db('mywallet');
})


server.post('/cadastro', async (req, res) => {

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

})

server.post('/', async (req, res) => {

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

});

server.get('/list', async (req, res) => {

    try{

        const authorization = req.headers.authorization;
        const token = authorization?.replace('Bearer ', '');
        console.log(token);

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
        console.log(user);
        
        const list = await db.collection('list').find({userId: user._id}).toArray();
        console.log(list);

        if(user) {

            res.send(list);
            res.sendStatus(201);

        } else {

            res.sendStatus(401);

        }

    } catch {

        res.sendStatus(500);
    }

})

server.post('/NovaEntrada', async (req, res) => {
   
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
})

server.post('/NovaSaida', async (req, res) => {

    
    
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
})

server.listen(5000, () => {
    console.log('ok');
});
