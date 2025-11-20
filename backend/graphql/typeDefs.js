import pkg from 'apollo-server';
const { gql } = pkg;

export default gql`

    # Тип пользователя
    type User {
        id: ID!
        username: String!
        email: String!
        role: String! 
        createdAt: String!
        token: String!
    }

     # Input для регистрации
    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }

    input CreateProductInput {
        name: String!
        description: String!
        price: Float!
        categoryId: ID!
        stock: Int!
        image: String
    }


     # Input для обновления продукта
    input UpdateProductInput {
        name: String
        description: String
        price: Float
        categoryId: ID
        stock: Int
        image: String
    }

     # 🛒 ORDER TYPES - НОВОЕ!
    
    type OrderItem {
        product: ID!
        name: String!
        price: Float!
        quantity: Int!
        image: String
    }

       type ShippingAddress {
        fullName: String!
        address: String!
        city: String!
        postalCode: String!
        country: String!
        phone: String!
    }

        type Order {
        id: ID!
        user: User!
        items: [OrderItem!]!
        totalAmount: Float!
        status: String!
        shippingAddress: ShippingAddress!
        paymentMethod: String!
        isPaid: Boolean!
        paidAt: String
        isDelivered: Boolean!
        deliveredAt: String
        createdAt: String!
    }


     # 🛒 CART TYPES - НОВОЕ!
    
    type CartItem {
        product: Product!
        quantity: Int!
    }

    type Cart {
        id: ID!
        user: User!
        items: [CartItem!]!
        updatedAt: String!
    }

    input CartItemInput {
        productId: ID!
        quantity: Int!
    }


    # Inputs для заказов
    input OrderItemInput {
        productId: ID!
        quantity: Int!
    }

      input ShippingAddressInput {
        fullName: String!
        address: String!
        city: String!
        postalCode: String!
        country: String!
        phone: String!
    }

      input CreateOrderInput {
        items: [OrderItemInput!]!
        shippingAddress: ShippingAddressInput!
        paymentMethod: String!
    }

    

       # Category Types
    type Category {
        id: ID!
        name: String!
        createdAt: String!
    }

        # Product Types
    type Product {
        id: ID!
        name: String!
        description: String!
        price: Float!
        image: String
        category: Category
        stock: Int!
        createdAt: String!
    }



    # Запросы (читать данные)
     type Query {
        getUser(userId: ID!): User
        getCurrentUser: User!

        # Categories
        getCategories: [Category]
        getCategory(categoryId: ID!): Category

         # Products
        getProducts: [Product]
        getProduct(productId: ID!): Product
        getProductsByCategory(categoryId: ID!): [Product]

        # Orders - НОВОЕ!
        getMyOrders: [Order!]!
        getOrder(orderId: ID!): Order!
        getAllOrders: [Order!]!  # Только для админа

        # Cart - НОВОЕ!
        getMyCart: Cart
    }

     # Мутации (изменять данные)

     type Mutation {

        # Auth
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!
        createAdmin(registerInput: RegisterInput): User! 

         # Categories
        createCategory(name: String!): Category!
        deleteCategory(categoryId: ID!): String!



          # Products
        createProduct(productInput: CreateProductInput): Product!
        updateProduct(productId: ID!, productInput: UpdateProductInput!): Product!
        deleteProduct(productId: ID!): String!

         # Orders - НОВОЕ!
        createOrder(orderInput: CreateOrderInput!): Order!
        updateOrderStatus(orderId: ID!, status: String!): Order!  # Для админа
        cancelOrder(orderId: ID!): Order!


        # Cart - НОВОЕ!
        addToCart(productId: ID!, quantity: Int): Cart!
        removeFromCart(productId: ID!): Cart!
        updateCartItemQuantity(productId: ID!, quantity: Int!): Cart!
        clearCart: Cart!
     }

      # Subscriptions
    type Subscription {
        newProduct: Product!
    }


`