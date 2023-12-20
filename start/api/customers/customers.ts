import Route from '@ioc:Adonis/Core/Route'

export default function customerRoutes() {
  Route.group(() => {
    Route.post('submit-phonenumber', 'Api/TempUsersController.postPhoneNumber')
    Route.post('submit-otp', 'Api/TempUsersController.postOTP')
    Route.post('submit-finalcredentials', 'Api/TempUsersController.postNamePlusPassword')
    Route.post('register', 'AuthController.register')
    Route.post('login', 'AuthController.login')
  }).prefix('/api')
}
