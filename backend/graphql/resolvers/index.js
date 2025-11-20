import usersResolvers from './users.js'
import categoriesResolvers from './categories.js';
import productsResolvers from './products.js'
import ordersResolvers from './orders.js';
import cartResolvers from './cart.js'; 


export default {
    Query: {
        ...usersResolvers.Query,
        ...categoriesResolvers.Query,
        ...productsResolvers.Query,
        ...cartResolvers.Query 

    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...categoriesResolvers.Mutation,
        ...productsResolvers.Mutation,
        ...ordersResolvers.Mutation,
        ...cartResolvers.Mutation 

    },
    Subscription: {
        ...productsResolvers.Subscription  // 👈 Добавь сюда
    }
}