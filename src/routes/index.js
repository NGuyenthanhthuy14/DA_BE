import user from './auth.route'
import product from './product.route'
import shopRoute from './shop.route'
import specialtyRoute from './specialty.route'
import adminRoute from './admin'
import categoryRoute from './category.route'
import orderRoute from './order.route'

const routes = (app) => {
    app.use('/api/user', user)
    app.use('/api/product',product)
    app.use("/api/shops", shopRoute);
    app.use("/api/specialties", specialtyRoute);
    app.use("/api/order", orderRoute);
    app.use("/api/categories", categoryRoute);
    app.use("/api/admin", adminRoute);
}
module.exports = routes
