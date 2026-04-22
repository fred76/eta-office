import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config'
import { db } from '../db/client'

export const authRouter = Router()

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return void res.status(400).json({ error: 'email and password required' })

    const user = await db.query.officeUsers.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    })
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return void res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRY as any }
    )
    res.json({ token, role: user.role })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})
