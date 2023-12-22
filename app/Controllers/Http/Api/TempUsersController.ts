import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TempUser from 'App/Models/TempUser'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Customer from 'App/Models/Customer'
import Logger from '@ioc:Adonis/Core/Logger'
export default class TempUsersController {
  public async postPhoneNumber({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      phonenumber: schema.string(),
    })
    request.validate({
      schema: newPostSchema,
    })
    try {
      const phonenumber = request.input('phonenumber')

      const user = await TempUser.findBy('phonenumber', phonenumber)

      if (user === null) {
        const user = new TempUser()
        user.phonenumber = phonenumber
        user.otp = Math.floor(100000 + Math.random() * 900000)
        await user.save()
      } else {
        user.otp = Math.floor(100000 + Math.random() * 900000)
        await user.save()
      }

      return response.ok('Information Successfully Captured')
    } catch (error) {
      response.badRequest({ error: error.message })
    }
  }

  public async postEmail({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      phonenumber: schema.string([rules.required()]),
      email: schema.string([rules.required(), rules.email()]),
    })
    request.validate({
      schema: newPostSchema,
    })
    try {
      const phonenumber = request.input('phonenumber')

      const user = await TempUser.findBy('phonenumber', phonenumber)

      if (user === null) {
        return response.badRequest({ error: 'Please Make Sure You hav confirmed OTP' })
      } else {
        user.email = request.input('email')
        await user.save()
      }

      return response.ok('Email Successfully Captured')
    } catch (error) {
      response.badRequest({ error: error.message })
    }
  }

  public async postOTP({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      phonenumber: schema.string(),
      otp: schema.string(),
    })
    request.validate({
      schema: newPostSchema,
    })
    try {
      const phonenumber = request.input('phonenumber')

      const otp = request.input('otp')
      const user = await TempUser.findBy('phonenumber', phonenumber)

      if (user !== null) {
        if (otp !== user.otp) {
          return response.badRequest({ error: 'OTP Mistmatch Detected' })
        } else {
          user.otp_matched = 1
          await user.save()
        }
      } else {
        response.badRequest({ error: 'Please Submit Phone Number before submititng OTP Code' })
      }

      return response.ok('OTP Successfully Submitted')
    } catch (error) {
      response.badRequest({ error: error.message })
    }
  }

  public async postNamePlusPassword({ request, response, auth }: HttpContextContract) {
    const newPostSchema = schema.create({
      phonenumber: schema.string([rules.required()]),
      name: schema.string([rules.required()]),
      password: schema.string([rules.confirmed('confirm_password')]),
    })

    const messages = {
      '*': (field, rule, arrayExpressionPointer, options) => {
        return `${field} failed ${rule} validation`
      },
    }

    try {
      const phonenumber = request.input('phonenumber')
      await request.validate({ schema: newPostSchema, messages })

      const tempUser = await TempUser.findBy('phonenumber', phonenumber)

      if (tempUser?.otp_matched === 1) {
        const email = tempUser.email
        const password = request.input('password')
        const name = request.input('name')

        /**
         * Create a new user
         */

        const user = new Customer()
        user.email = email
        user.password = password
        user.name = name
        user.phonenumber = phonenumber
        await user.save()

        const token = await auth.use('api').login(user, {
          expiresIn: '10 days',
        })

        return token.toJSON()
      } else {
        return response.status(422).send('Please Make Sure to Confirm OTP')
      }
    } catch (error) {
      if (error.code === 'E_VALIDATION_FAILURE') {
        var array: String[] = []
        var finalErrors = error.messages.errors
        for (let index = 0; index < finalErrors.length; index++) {
          array.push(finalErrors[index].message)
        }

        response.status(422).send(array)
      } else {
        response.status(422).send(error.message)
      }
    }
  }
}
