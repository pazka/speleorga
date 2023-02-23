// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type {NextApiRequest, NextApiResponse} from 'next'
import config from '../../services/config'
import {PrismaClient} from '@prisma/client'
import prismaClient from "@/services/db-services";
import {validateSuperAdmin} from "@/services/auth-service";
import {arrayContainsEmptyString, getEmptyKeyFromObject} from "@/services/utils";


export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
) {
}
