import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_CATEGORIES = gql`
  query GetCategories {
    getCategories {
      id
      name
      createdAt
    }
  }
`;

const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      name
      description
      price
      stock
      image
      category {
        id
        name
      }
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($productInput: CreateProductInput!) {
    createProduct(productInput: $productInput) {
      id
      name
      price
    }
  }
`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products'); // 'products' или 'categories'
  
  // Category Form
  const [categoryName, setCategoryName] = useState('');
  
  // Product Form
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '',
    image: ''
  });

  // Queries
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(GET_PRODUCTS);

  // Mutations
  const [createCategory, { loading: createCategoryLoading }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    onCompleted: () => {
      setCategoryName('');
      alert('Категория создана!');
    }
  });

  const [createProduct, { loading: createProductLoading }] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      setProductForm({
        name: '',
        description: '',
        price: '',
        categoryId: '',
        stock: '',
        image: ''
      });
      alert('Товар создан!');
    }
  });

  const handleCreateCategory = (e) => {
    e.preventDefault();
    createCategory({ variables: { name: categoryName } });
  };

  const handleCreateProduct = (e) => {
    e.preventDefault();
    createProduct({
      variables: {
        productInput: {
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          categoryId: productForm.categoryId,
          stock: parseInt(productForm.stock),
          image: productForm.image || 'https://via.placeholder.com/300'
        }
      }
    });
  };

  const handleProductFormChange = (e) => {
    setProductForm({
      ...productForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">⚙️ Админ панель</h1>
        <p className="text-base-content/60">Управление товарами и категориями</p>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <a 
          className={`tab ${activeTab === 'products' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Товары
        </a>
        <a 
          className={`tab ${activeTab === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Категории
        </a>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Product Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Создать товар</h2>
              
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Название</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    className="input input-bordered"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Описание</span>
                  </label>
                  <textarea
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    className="textarea textarea-bordered"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Цена</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={productForm.price}
                      onChange={handleProductFormChange}
                      step="0.01"
                      className="input input-bordered"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Количество</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={productForm.stock}
                      onChange={handleProductFormChange}
                      className="input input-bordered"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Категория</span>
                  </label>
                  <select
                    name="categoryId"
                    value={productForm.categoryId}
                    onChange={handleProductFormChange}
                    className="select select-bordered"
                    required
                  >
                    <option value="">Выберите категорию</option>
                    {categoriesData?.getCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">URL изображения</span>
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={productForm.image}
                    onChange={handleProductFormChange}
                    className="input input-bordered"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={createProductLoading}
                >
                  {createProductLoading ? 'Создание...' : 'Создать товар'}
                </button>
              </form>
            </div>
          </div>

          {/* Products List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Список товаров</h2>
              
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {productsData?.getProducts.map((product) => (
                    <div key={product.id} className="card bg-base-200">
                      <div className="card-body p-4">
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm text-base-content/60">{product.description}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-bold">${product.price}</span>
                          <span className="badge">{product.category.name}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Category Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Создать категорию</h2>
              
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Название категории</span>
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="input input-bordered"
                    placeholder="Электроника"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={createCategoryLoading}
                >
                  {createCategoryLoading ? 'Создание...' : 'Создать категорию'}
                </button>
              </form>
            </div>
          </div>

          {/* Categories List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Список категорий</h2>
              
              {categoriesLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoriesData?.getCategories.map((category) => (
                    <div key={category.id} className="card bg-base-200">
                      <div className="card-body p-4">
                        <h3 className="font-bold">{category.name}</h3>
                        <p className="text-sm text-base-content/60">
                          Создана: {new Date(category.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}