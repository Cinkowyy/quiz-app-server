import { Router } from 'express';

import { getUserController, getRegisterController, getLoginController } from '../controllers/identityController';
import getAuthorization from '../middleware/authMiddleware';
import validation from '../middleware/validationMiddleware';
import { PrismaClient } from '@prisma/client';
import { loginSchema, registerSchema } from '../types/userTypes';
import { z } from 'zod';

const getIdentityRoutes = ({ prisma, jwtSecret }: { prisma: PrismaClient, jwtSecret: string }) => {

    const router = Router();

    const registerValidationSchema = z.object({
        body: registerSchema
    })

    router.post('/register', validation(registerValidationSchema), getRegisterController({ prisma }))

    const loginValidationSchema = z.object({
        body: loginSchema
    })

    router.post('/login', validation(loginValidationSchema), getLoginController({ prisma, jwtSecret }))

    router.get('/getUser', getAuthorization({ jwtSecret }), getUserController({ prisma }))

    return router
}


export default getIdentityRoutes