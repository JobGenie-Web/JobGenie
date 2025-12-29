import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
}

/**
 * Sign a JWT token with user data
 * Token expires in 7 days by default
 */
export async function signToken(payload: JWTPayload): Promise<string> {
    const token = await new jose.SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(JWT_SECRET);

    return token;
}

/**
 * Verify and decode a JWT token
 * Returns the payload if valid, null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jose.jwtVerify(token, JWT_SECRET);
        return payload as unknown as JWTPayload;
    } catch {
        return null;
    }
}

/**
 * Get token expiry date (7 days from now)
 */
export function getTokenExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return expiry;
}
