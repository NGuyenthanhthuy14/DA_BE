import user from './auth'
import product from './product'
import shopRoute from './shop.route'
import specialtyRoute from './specialty.route'
const orderRoute = require('./order.route')
const categoryRoute = require('./category.route')

const routes = (app) => {
    app.use('/api/user', user)
    app.use('/api/product',product)
    app.use("/api/shops", shopRoute);
    app.use("/api/specialties", specialtyRoute);
    app.use("/api/order", orderRoute);
    app.use("/api/categories", categoryRoute);
}
module.exports = routes