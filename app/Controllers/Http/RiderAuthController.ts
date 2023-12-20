import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Rider from 'App/Models/Rider'

export default class RiderAuthController {
  public async login({ request, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')

    const token = await auth.use('rider').attempt(email, password, {
      expiresIn: '20 days',
    })
    return token.toJSON()
  }

  public async register({ request, auth }: HttpContextContract) {
    const email = request.input('email')
    const password = request.input('password')
    const name = request.input('name')
    const phonenumber = request.input('phonenumber')
    const idnumber = request.input('idnumber')

    /**
     * Create a new user
     */

    const user = new Rider()
    user.email = email
    user.password = password
    user.name = name
    user.phonenumber = phonenumber
    user.idnumber = idnumber
    await user.save()

    const token = await auth.use('rider').login(user, {
      expiresIn: '20 days',
    })

    return token.toJSON()
  }
}
