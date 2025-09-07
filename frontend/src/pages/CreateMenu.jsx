import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5197'; 

export default function CreateProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    isPromotion: false,
    categoryId: '',
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchCategories = async () => {

      if (!authToken) {
        setError('Erro: Token de autenticação não encontrado. Faça login novamente.');
        return;
      }
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Categories`, {
          headers: {
            'Authorization': `Bearer ${authToken}` 
          },
        });
        setCategories(response.data);
      } catch (err) {
        setError('Erro ao carregar categorias.');
        console.error('Erro ao carregar categorias:', err);
      }
    };
    fetchCategories();
  }, [authToken]); 

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!authToken) {
      setLoading(false);
      setError('Erro: Token de autenticação não encontrado. Faça login novamente.');
      return;
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      isPromotion: formData.isPromotion,
      categoryId: parseInt(formData.categoryId, 10),
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/Products`, productData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}` 
        },
      });
      setSuccess(`Produto "${response.data.name}" criado com sucesso!`);
      // Limpa o formulário após o sucesso
      setFormData({
        name: '',
        description: '',
        price: '',
        isPromotion: false,
        categoryId: '',
      });
      // Opcional: redireciona o usuário após a criação
      // navigate('/admin');
    } catch (err) {
      setError('Erro ao criar o produto. Por favor, tente novamente.');
      console.error('Erro ao criar produto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F5F0] p-4 font-inter">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-lg">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-[#588157] font-semibold hover:text-[#4A724A] transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar
        </button>

        <h2 className="mb-6 text-center text-3xl font-bold text-[#588157]">Criar Novo Produto</h2>
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#2C5234]">
              Nome do Produto
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#588157] focus:ring-[#588157] sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#2C5234]">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#588157] focus:ring-[#588157] sm:text-sm"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-[#2C5234]">
                Preço
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#588157] focus:ring-[#588157] sm:text-sm"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPromotion"
                name="isPromotion"
                checked={formData.isPromotion}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#588157] focus:ring-[#588157]"
              />
              <label htmlFor="isPromotion" className="ml-2 block text-sm font-medium text-[#2C5234]">
                Item em Promoção
              </label>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-[#2C5234]">
              Categoria
            </label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#588157] focus:ring-[#588157] sm:text-sm"
            >
              <option value="" disabled>Selecione uma categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mensagens de feedback */}
          {loading && <p className="text-center text-gray-500">Criando produto...</p>}
          {error && <p className="text-center font-semibold text-red-500">{error}</p>}
          {success && <p className="text-center font-semibold text-green-600">{success}</p>}

          {/* Botão de Envio */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-md px-4 py-2 font-bold text-white transition duration-300 ${
                loading ? 'cursor-not-allowed bg-gray-400' : 'bg-[#588157] hover:bg-[#4A724A]'
              }`}
            >
              {loading ? 'Criando...' : 'Criar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
