import responses from '../controllers/addContentController.js';
import getList from '../controllers/getContentController.js';
import { Router } from 'express';

const contentRouter = Router();

contentRouter.post('/NovaEntrada', responses.income);
contentRouter.post('/NovaSaida', responses.expense);
contentRouter.get('/list', getList);

export default contentRouter;

