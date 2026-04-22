import { Injectable, inject, signal, computed } from '@angular/core'
import { Router } from '@angular/router'
import { ApiService } from './api.service'

interface JwtPayload {
  userId: number
  role: string
  exp: number
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api    = inject(ApiService)
  private router = inject(Router)

  private $token = signal<string | null>(localStorage.getItem('eta_token'))
  private $role  = signal<string | null>(localStorage.getItem('eta_role'))

  isLoggedIn = computed(() => {
    const token = this.$token()
    if (!token) return false
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as JwtPayload
      return payload.exp * 1000 > Date.now()
    } catch {
      return false
    }
  })

  isAdmin = computed(() => this.$role() === 'admin')
  role    = computed(() => this.$role())
  token   = computed(() => this.$token())

  async login(email: string, password: string): Promise<void> {
    const res = await this.api.login(email, password)
    localStorage.setItem('eta_token', res.token)
    localStorage.setItem('eta_role', res.role)
    this.$token.set(res.token)
    this.$role.set(res.role)
    await this.router.navigate(['/dashboard'])
  }

  logout(): void {
    localStorage.removeItem('eta_token')
    localStorage.removeItem('eta_role')
    this.$token.set(null)
    this.$role.set(null)
    this.router.navigate(['/login'])
  }
}
