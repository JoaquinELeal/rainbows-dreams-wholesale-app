import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface ApprovalTokenPayload {
  registrationId: number;
  action: 'approve' | 'reject';
  shopifyCustomerId: string;
  exp?: number;
}

export function generateApprovalToken(payload: Omit<ApprovalTokenPayload, 'exp'>): string {
  return jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) }, // 7 days
    JWT_SECRET as string
  );
}

export function verifyApprovalToken(token: string): ApprovalTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as jwt.JwtPayload;
    
    // Validate the payload structure
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.registrationId === 'number' &&
      typeof decoded.action === 'string' &&
      typeof decoded.shopifyCustomerId === 'string' &&
      (decoded.action === 'approve' || decoded.action === 'reject')
    ) {
      return decoded as ApprovalTokenPayload;
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
