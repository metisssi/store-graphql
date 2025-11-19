import pkg from 'apollo-server';
const { gql } = pkg;

export default gql`

    # Тип пользователя
    type User {
        id: ID!
        username: String!
        email: String!
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
        category: Category!
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
    }

     # Мутации (изменять данные)

     type Mutation {

        # Auth
        register(registerInput: RegisterInput): User!
        login(username: String!, password: String!): User!

         # Categories
        createCategory(name: String!): Category!
        deleteCategory(categoryId: ID!): String!



          # Products
        createProduct(productInput: CreateProductInput): Product!
        updateProduct(productId: ID!, productInput: UpdateProductInput!): Product!
        deleteProduct(productId: ID!): String!
     }

      # Subscriptions
    type Subscription {
        newProduct: Product!
    }


`