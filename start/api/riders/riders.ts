import Route from '@ioc:Adonis/Core/Route'

export default function riderRoutes() {
  Route.group(() => {
    Route.post('register', 'RiderAuthController.register')
    Route.post('login', 'RiderAuthController.login')
  }).prefix('/riders')
}
