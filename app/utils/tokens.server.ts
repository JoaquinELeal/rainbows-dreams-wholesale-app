import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface ApprovalTokenPayload {
  registrationId: number;
  action: 'approve' | 'reject';
  shopifyCustomerId: string;
  exp?: number;
}

export function generateApprovalToken(payload: Omit<ApprovalTokenPayload, 'exp'>): string {
  return jwt.sign(
    { ...payload, exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) }, // 7 days
    JWT_SECRET
  );
}

export function verifyApprovalToken(token: string): ApprovalTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ApprovalTokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}
