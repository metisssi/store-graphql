// backend/graphql/typeDefs.js
import pkg from 'apollo-server';
const { gql } = pkg;

export default gql`

    # ===== USER TYPES =====
    type User {
        id: ID!
        username: String!
        email: String!
        role: String! 
        createdAt: String!
        token: String!
    }

    input RegisterInput {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }

    # ===== CATEGORY TYPES =====
    type Category {
        id: ID!
        name: String!
        createdAt: String!
    }

    # ===== PRODUCT TYPES =====
    type Product {
        id: ID!
        name: String!
        description: String!
        price: Float!
        image: String
        category: Category
        stock: Int!
        averageRating: Float
        reviewCount: Int
        createdAt: String!
    }

    input CreateProductInput {
        name: String!
        description: String!
        price: Float!
        categoryId: ID!
        stock: Int!
        image: String
    }

    input UpdateProductInput {
        name: String
        description: String
        price: Float
        categoryId: ID
        stock: Int
        image: String
    }

    # ===== ORDER TYPES =====
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
        paymentMethod: String!
        isPaid: Boolean!
        paidAt: String
        paymentIntentId: String
        paymentStatus: String!
        status: String!
        shippingAddress: ShippingAddress!
        isDelivered: Boolean!
        deliveredAt: String
        trackingNumber: String
        notes: String
        createdAt: String!
        updatedAt: String!
    }

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

    # ===== CART TYPES =====
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

    # ===== PAYMENT TYPES =====
    type PaymentIntent {
        clientSecret: String! 
        amount: Float!
    }

    # ===== REVIEW TYPES =====
    type Review {
        id: ID!
        user: User!
        product: Product!
        rating: Int!
        title: String!
        comment: String!
        createdAt: String!
        updatedAt: String!
    }

    type ReviewsResponse {
        reviews: [Review!]!
        total: Int!
        hasMore: Boolean!
    }

    type CanReviewResponse {
        canReview: Boolean!
        reason: String
        existingReview: Review
    }

    input ReviewInput {
        rating: Int!
        title: String!
        comment: String!
    }

    input UpdateReviewInput {
        rating: Int
        title: String
        comment: String
    }

    # ===== QUERIES =====
    type Query {
        # User
        getUser(userId: ID!): User
        getCurrentUser: User!

        # Categories
        getCategories: [Category]
        getCategory(categoryId: ID!): Category

        # Products
        getProducts: [Product]
        getProduct(productId: ID!): Product
        getProductsByCategory(categoryId: ID!): [Product]

        # Orders
        getMyOrders: [Order!]!
        getOrder(orderId: ID!): Order!
        getAllOrders: [Order!]!

        # Cart
        getMyCart: Cart

        # Reviews
        getProductReviews(productId: ID!, limit: Int, offset: Int): ReviewsResponse!
        getMyReviews: [Review!]!
        canReviewProduct(productId: ID!): CanReviewResponse!
    }

    # ===== MUTATIONS =====
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

        # Orders
        createOrder(orderInput: CreateOrderInput!): Order!
        updateOrderStatus(orderId: ID!, status: String!): Order!
        cancelOrder(orderId: ID!): Order!

        # Cart
        addToCart(productId: ID!, quantity: Int): Cart!
        removeFromCart(productId: ID!): Cart!
        updateCartItemQuantity(productId: ID!, quantity: Int!): Cart!
        clearCart: Cart!

        # Payment
        createPaymentIntent: PaymentIntent!
        createOrderAfterPayment(
            paymentIntentId: String!
            shippingAddress: ShippingAddressInput!
        ): Order!

        # Reviews
        createReview(productId: ID!, reviewInput: ReviewInput!): Review!
        updateReview(reviewId: ID!, reviewInput: UpdateReviewInput!): Review!
        deleteReview(reviewId: ID!): String!
    }

    # ===== SUBSCRIPTIONS =====
    type Subscription {
        newProduct: Product!
    }
`;