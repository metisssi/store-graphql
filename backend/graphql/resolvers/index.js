import usersResolvers from './users.js'
import categoriesResolvers from './categories.js';
import productsResolvers from './products.js'

export default {
    Query: {
        ...usersResolvers.Query,
        ...categoriesResolvers.Query,
        ...productsResolvers.Query

    },
    Mutation: {
        ...usersResolvers.Mutation,
        ...categoriesResolvers.Mutation,
        ...productsResolvers.Mutation

    },
    Subscription: {
        ...productsResolvers.Subscription  // 👈 Добавь сюда
    }
}