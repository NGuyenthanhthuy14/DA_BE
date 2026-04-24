import user from './auth'
import product from './product'
import shopRoute from './shop.route'
const routes = (app) => {
    app.use('/api/user', user)
    app.use('/api/product',product)
    app.use("/api/shops", shopRoute);
}
module.exports = routes