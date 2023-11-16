import {Router} from 'express';

import getAuthorization from '../middleware/authMiddleware';
import { getCreateQuizController, getQuizzesController } from '../controllers/quizzesController';
import { PrismaClient } from '@prisma/client';
import { JwtInfo } from '../utils/jwtInfo';

const getQuizzesRoutes = ({prisma, jwtInfo}: {prisma: PrismaClient, jwtInfo: JwtInfo}) => {

    const router = Router();
    
    router.post('/createQuiz', getAuthorization({jwtSecret: jwtInfo.secret}), getCreateQuizController({prisma}))
    router.get('/getQuizzes', getQuizzesController({prisma}))

    return router
}


export default getQuizzesRoutes