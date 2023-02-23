// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import config from '@/services/config'
import prismaClient from "@/services/db-services";
import {hashPassword, validateSuperAdmin} from "@/services/auth-service";
import {arrayContainsEmptyString, getEmptyKeyFromObject} from "@/services/utils";
import {User} from "@prisma/client";
import {ErrorResponse} from "@/dto/responses";


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<User | ErrorResponse>
) {
    const {method, query, body} = req;
    
    if (method != "POST") {
        return res.status(405).json({message: "Method not allowed"})
    }

    if (!config("allow_admin_creation")) {
        return res.status(403).json({message: "Forbidden"})
    }

    if (!validateSuperAdmin(req)) {
        return res.status(401).json({message: "Unauthorized"})
    }

    const {name, email, password} = body;

    if (arrayContainsEmptyString([name, email, password])) {
        return res.status(400).json({message: getEmptyKeyFromObject({name, email, password}) + " is required"})
    }

    hashPassword(password).then((hashedPassword) => {
        prismaClient.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: "ADMIN"
            },
        }).then((user) => {
            return res.status(200).json({message: "User created successfully"})
        }).catch((err) => {
            return res.status(500).json({message: "Internal server error\n" + err})
        })
    }).catch((err) => {
        return res.status(500).json({message: "Internal server error while hashin psw\n" + err})
    })
}
