import * as jwt from 'jsonwebtoken'
import type { User } from '@scaffold/database'
import { config } from '../config'

export interface TokenPayload {
  id: number
  email: string
}

export const authService = {
  /**
   * Uses Bun's built-in password hashing (argon2id) rather than the `bcrypt`
   * package, which ships native binaries that break across ABI changes.
   * `Bun.password.verify` auto-detects the algorithm, so bcrypt hashes written
   * by earlier versions of this app still verify correctly.
   */
  hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password)
  },

  comparePassword(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash)
  },

  generateToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions)
  },

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload
    } catch {
      return null
    }
  },
}
