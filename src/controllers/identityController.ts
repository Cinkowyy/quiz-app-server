import { NextFunction, Response } from "express"
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { IUserRegisterBody, ILoggingUser } from "../types/userTypes"
import { PrismaClient } from "@prisma/client"
import { RequestWithUserId, TypedRequest } from "../types/typedRequests"

export const getRegisterController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: TypedRequest<IUserRegisterBody>, res: Response, next: NextFunction) => {

        try {
            const { nickname, email, password } = req.body;

            // Check if user exists
            const userExists = await prisma.users.findFirst({ where: { email } })

            if (userExists) {
                res.status(400)
                throw new Error("User already exists")
            }

            //Hash password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            // Create user
            await prisma.users.create({
                data: {
                    nickname,
                    email,
                    password: hashedPassword
                }
            })
            res.status(200).json({
                message: "User created succesfully"
            })

        } catch (error) {
            next(error);
        }
    }
}

export const getLoginController = ({ prisma, jwtSecret }: { prisma: PrismaClient, jwtSecret: string }) => {

    return async (req: TypedRequest<ILoggingUser>, res: Response) => {
        const { email, password } = req.body

        if (!email || !password) {
            res.status(400)
            throw new Error("Please add all required fields")
        }

        const user = await prisma.users.findFirst({ where: { email } })

        if (user && (await bcrypt.compare(password, user.password))) {
            res.status(201).json({
                accessToken: generateJwtToken(user.id, jwtSecret)
            })
        } else {
            res.status(400)
            throw new Error('Invalid credentials')
        }
    }
}

export const getUserController = ({ prisma }: { prisma: PrismaClient }) => {

    return async (req: RequestWithUserId, res: Response) => {
        try {
            const userId = req?.userId

            if (!userId) {
                throw new Error("No user id in request")
            }

            const user = await prisma.users.findFirst({
                where: { id: userId },
                select: { email: true, nickname: true }
            })
            res.json(user)
        } catch (error) {
            console.log(error)
        }
    }
}

//Generate JWT
const generateJwtToken = (userID: string, jwtSecret: string) => {
    return Jwt.sign({
        sub: userID
    },
        jwtSecret,
        {
            expiresIn: '1d'
        })
}