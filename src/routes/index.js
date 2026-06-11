import authRoute from './auth.route'
import userRoute from './user.route'
import product from './product.route'
import shopRoute from './shop.route'
import specialtyRoute from './specialty.route'
import specialtyStoryRoute from './specialtyStory.route'
import adminRoute from './admin'
import vendorRoute from './vendor'
import orderRoute from './order.route'
import searchRoute from './search.route'
import paymentRoute from './payment.route'
import shippingRoute from './shipping.route'
import ghnRoute from './ghn.route'

const routes = (app) => {
    app.use('/api/auth', authRoute)
    app.use('/api/user', userRoute)
    app.use('/api/product',product)
    app.use("/api/shops", shopRoute);
    app.use("/api/specialties", specialtyRoute);
    app.use("/api/specialty-stories", specialtyStoryRoute);
    app.use("/api/order", orderRoute);
    app.use("/api/search", searchRoute);
    app.use("/api/payments", paymentRoute);
    app.use("/api/shipping", shippingRoute);
    app.use("/api/ghn", ghnRoute);
    app.use("/api/admin", adminRoute);
    app.use("/api/vendor", vendorRoute);
}
module.exports = routes
