function decodeJwtPayload<T>(token: string): T {
  const base64Payload = token.split('.')[1];
  const payload = Buffer.from(base64Payload, 'base64').toString('utf8');
  return JSON.parse(payload);
}

export function validateJwtNotExpired(token: string): boolean {
  const payload = decodeJwtPayload<{ exp: number }>(token);
  return payload.exp > Date.now() / 1000;
}
