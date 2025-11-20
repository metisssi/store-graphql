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

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($categoryId: ID!) {
    deleteCategory(categoryId: $categoryId)
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

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [categoryName, setCategoryName] = useState('');
  
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
  const { data: productsData, loading: productsLoading } = useQuery(GET_PRODUCTS);

  // Mutations
  const [createCategory, { loading: createCategoryLoading }] = useMutation(CREATE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    onCompleted: () => {
      setCategoryName('');
      alert('✅ Категория создана!');
    },
    onError: (error) => {
      alert('❌ Ошибка: ' + error.message);
    }
  });

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: GET_CATEGORIES }],
    onCompleted: () => {
      alert('✅ Категория удалена!');
    },
    onError: (error) => {
      alert('❌ ' + error.message);
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
      alert('✅ Товар создан!');
    },
    onError: (error) => {
      alert('❌ Ошибка: ' + error.message);
    }
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
    onCompleted: () => {
      alert('✅ Товар удален!');
    },
    onError: (error) => {
      alert('❌ ' + error.message);
    }
  });

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (categoryName.trim() === '') return;
    createCategory({ variables: { name: categoryName } });
  };

  const handleDeleteCategory = (categoryId, categoryName) => {
    if (window.confirm(`Удалить категорию "${categoryName}"?`)) {
      deleteCategory({ variables: { categoryId } });
    }
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

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`Удалить товар "${productName}"?`)) {
      deleteProduct({ variables: { productId } });
    }
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
          📦 Товары
        </a>
        <a 
          className={`tab ${activeTab === 'categories' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Категории
        </a>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Product Form */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">➕ Создать товар</h2>
              
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
                    rows="3"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Цена ($)</span>
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
                  <label className="label">
                    <span className="label-text-alt">
                      💡 <a href="https://imgbb.com/" target="_blank" rel="noreferrer" className="link link-primary">Загрузить на ImgBB</a>
                    </span>
                  </label>
                  
                  {productForm.image && (
                    <div className="mt-2">
                      <p className="text-sm mb-1">Превью:</p>
                      <img 
                        src={productForm.image} 
                        alt="Preview" 
                        className="h-32 w-32 object-cover rounded-lg border"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300';
                        }}
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={createProductLoading}
                >
                  {createProductLoading ? 'Создание...' : '✨ Создать товар'}
                </button>
              </form>
            </div>
          </div>

          {/* Products List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📋 Список товаров ({productsData?.getProducts.length || 0})</h2>
              
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {productsData?.getProducts.map((product) => (
                    <div key={product.id} className="card bg-base-200 hover:bg-base-300 transition">
                      <div className="card-body p-4">
                        <div className="flex gap-3">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="text-sm text-base-content/60 line-clamp-1">{product.description}</p>
                            <div className="flex gap-2 items-center mt-1">
                              <span className="font-bold text-primary">${product.price}</span>
                              <span className="badge badge-sm">{product.category.name}</span>
                              <span className="text-xs">Stock: {product.stock}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleDeleteProduct(product.id, product.name)}
                            className="btn btn-error btn-sm btn-circle"
                          >
                            🗑️
                          </button>
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
              <h2 className="card-title">➕ Создать категорию</h2>
              
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
                    placeholder="Например: Электроника, Одежда, Книги"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full"
                  disabled={createCategoryLoading}
                >
                  {createCategoryLoading ? 'Создание...' : '✨ Создать категорию'}
                </button>
              </form>

              {/* Примеры */}
              <div className="mt-4">
                <p className="text-sm text-base-content/60 mb-2">💡 Примеры категорий:</p>
                <div className="flex flex-wrap gap-2">
                  {['Электроника', 'Одежда', 'Книги', 'Спорт', 'Дом'].map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setCategoryName(cat)}
                      className="badge badge-outline badge-lg cursor-pointer hover:badge-primary"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Categories List */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📋 Список категорий ({categoriesData?.getCategories.length || 0})</h2>
              
              {categoriesLoading ? (
                <div className="flex justify-center py-8">
                  <span className="loading loading-spinner"></span>
                </div>
              ) : (
                <div className="space-y-3">
                  {categoriesData?.getCategories.map((category) => (
                    <div key={category.id} className="card bg-base-200 hover:bg-base-300 transition">
                      <div className="card-body p-4 flex-row justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg">🏷️ {category.name}</h3>
                          <p className="text-sm text-base-content/60">
                            Создана: {new Date(category.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="btn btn-error btn-sm btn-circle"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}

                  {categoriesData?.getCategories.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-base-content/60">Категорий пока нет</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}