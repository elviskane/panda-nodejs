import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import TempUser from 'App/Models/TempUser'
import { schema, rules,ValidationException } from '@ioc:Adonis/Core/Validator'

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

  public async postOTP({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      phonenumber: schema.string(),
      otp: schema.number(),
    })
    request.validate({
      schema: newPostSchema,
    })
    try {
      const phonenumber = request.input('phonenumber')

      const otp = request.input('otp')
      const user = await TempUser.findBy('phonenumber', phonenumber)

      if (user !== null) {
        if (user.otp !== otp) {
          response.badRequest({ error: 'OTP Mistmatch Detected' })
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

  public async postNamePlusPassword({ request, response }: HttpContextContract) {
    const newPostSchema = schema.create({
      phonenumber: schema.string({}, [rules.required()]),
      name: schema.string({}, [rules.required()]),
      password: schema.string({}, [rules.confirmed('confirm_password')]),
    })

    try {
      request.validate({
        schema: newPostSchema,
      })
      const phonenumber = request.input('phonenumber')

      const otp = request.input('otp')
      const user = await TempUser.findBy('phonenumber', phonenumber)

      if (user !== null) {
        if (user.otp !== otp) {
          response.badRequest({ error: 'OTP Mistmatch Detected' })
        } else {
          user.otp_matched = 1
          await user.save()
        }
      } else {
        response.badRequest({ error: 'Please Submit Phone Number before submititng OTP Code' })
      }

      return response.ok('OTP Successfully Submitted')
    } catch (error) {
      response.status(422).send(error.message)
    }catch ( error typeof ValidationException) {

    }

  }
}
