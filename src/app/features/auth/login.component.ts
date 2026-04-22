import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { AuthService } from '../../core/service/auth.service'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private auth = inject(AuthService)

  email    = signal('')
  password = signal('')
  loading  = signal(false)
  error    = signal<string | null>(null)

  async submit(): Promise<void> {
    if (!this.email() || !this.password()) return
    this.loading.set(true)
    this.error.set(null)
    try {
      await this.auth.login(this.email(), this.password())
    } catch {
      this.error.set('Invalid email or password')
    } finally {
      this.loading.set(false)
    }
  }
}
