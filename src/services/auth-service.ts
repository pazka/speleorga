import {NextApiRequest} from "next";
import config from "@/services/config";

const bcrypt = require('bcrypt');

const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
}

export async function validatePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash, (x: any) => x)
}

export function validateSuperAdmin(req: NextApiRequest): boolean {
    const pswd = config("admin_pswd")
    const generatedSuperAdminBasicAuthToken = Buffer.from(`admin:${pswd}`).toString('base64')
    return req.headers.authorization == `Basic ${generatedSuperAdminBasicAuthToken}`
}