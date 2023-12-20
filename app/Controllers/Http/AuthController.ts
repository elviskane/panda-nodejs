import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Customer from 'App/Models/Customer'

export default class AuthController {
  public async login({ request, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    const token = await auth.use('api').attempt(email, password, {
      expiresIn: '10 days',
    })
    return token.toJSON()
  }

  public async register({ request, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    const name = request.input('name')
    const phonenumber = request.input('phonenumber')

    /**
     * Create a new user
     */

    const user = new Customer()
    user.email = email
    user.password = password
    user.name = name
    user.phonenumber=phonenumber
    await user.save()

    const token = await auth.use('api').login(user, {
      expiresIn: '10 days',
    })

    return token.toJSON()
  }
}
