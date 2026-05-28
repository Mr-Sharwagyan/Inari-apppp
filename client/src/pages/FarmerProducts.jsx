import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Search, Edit3, Trash2, X, Sprout, Image } from 'lucide-react';
import { TableSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const FarmerProducts = () => {
  const { user } = useAuth();
  const showToast = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {
      const catRes = await api.get('/categories');
      setCategories(catRes.data);

      if (catRes.data.length > 0) {
        setCategory(catRes.data[0].name);
      }

      const prodRes = await api.get(`/products?farmer=${user._id}`);
      setProducts(prodRes.data);

    } catch (err) {
      console.error(err);
      showToast('Failed to load crop records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProduct(null);

    setName('');
    setDescription('');
    setPrice('');
    setUnit('kg');

    if (categories.length > 0) {
      setCategory(categories[0].name);
    }

    setStock('0');
    setImageUrl('');

    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);

    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setUnit(prod.unit);
    setCategory(prod.category);
    setStock(prod.stock.toString());
    setImageUrl(prod.images?.[0] || '');

    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!name || !description || !price || !category) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        unit,
        category,
        stock: parseInt(stock) || 0,
        images: imageUrl
          ? [imageUrl]
          : [
              'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80'
            ]
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        showToast('Crop listing updated successfully.', 'success');
      } else {
        await api.post('/products', payload);
        showToast('Crop listing created successfully.', 'success');
      }

      setIsModalOpen(false);
      loadData();

    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this crop listing?')) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      showToast('Crop listing removed.', 'success');

      loadData();

    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight font-sans">
            Crop Catalog
          </h2>

          <p className="text-xs text-sage-450 mt-0.5">
            List products and manage marketplace visibility.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-sm bg-white border border-stone-200/60 p-3 rounded-2xl shadow-soft">
        <Search className="absolute left-6 top-6 w-4 h-4 text-sage-400" />

        <input
          type="text"
          placeholder="Search crop products by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center space-y-3 shadow-soft flex flex-col items-center">
          <Sprout className="w-10 h-10 text-sage-355" />

          <div>
            <h3 className="font-bold text-base text-primary-950">
              No products registered
            </h3>

            <p className="text-xs text-sage-500">
              Create your first product to sync details with the marketplace catalog.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Product Detail</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Sync Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 text-primary-950 font-medium">
                {filteredProducts.map((prod) => (
                  <tr
                    key={prod._id}
                    className="hover:bg-stone-50/50 transition-colors"
                  >

                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 shrink-0 border">
                        <img
                          src={prod.images?.[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="font-bold text-sm leading-tight">
                          {prod.name}
                        </div>

                        <div className="text-[10px] text-sage-400 mt-0.5 truncate max-w-xs">
                          {prod.description}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] uppercase font-extrabold text-primary-750 bg-primary-50 px-2 py-0.5 rounded-full">
                        {prod.category}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-sm">
                      Rs.{prod.price.toFixed(2)}

                      <span className="text-[10px] text-sage-400 font-normal">
                        {' '} / {prod.unit}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className={`font-bold ${prod.stock > 15 ? 'text-primary-850' : 'text-amber-600 font-extrabold'}`}>
                        {prod.stock} {prod.unit}
                      </span>

                      {prod.stock <= 15 && (
                        <span className="text-[10px] block text-amber-600">
                          ⚠️ Low stock alert
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-2 text-sage-500 hover:text-primary-900 hover:bg-stone-100 rounded-lg transition-all"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(prod._id)}
                          className="p-2 text-sage-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Overlay */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/35 backdrop-blur-xs"
          />

          {/* Modal Body */}
          <div className="bg-white border border-stone-250 p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-xl relative z-10 space-y-5">

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-sage-400 hover:text-sage-600 hover:bg-stone-100 p-1.5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-primary-950 border-b border-stone-100 pb-3">
              {editingProduct ? 'Update Crop Details' : 'Register New Farm Crop'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">
                    Product Name *
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tomatoes, Wheat, Milk..."
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">
                    Product Category *
                  </label>

                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-medium"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">
                  Product Description *
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Harvest details..."
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">
                    Price (Rs.) *
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">
                    Sell Unit *
                  </label>

                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">
                    Initial Stock *
                  </label>

                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                    disabled={!!editingProduct}
                    required
                  />
                </div>

              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">
                  Product Image URL
                </label>

                <div className="relative">
                  <Image className="absolute left-3 top-3 w-4 h-4 text-sage-400" />

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 outline-none text-xs focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3.5">

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border border-stone-200 text-sage-600 hover:text-primary-900 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
                >
                  {saving ? 'Saving Crop Listing...' : 'Register Crop'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerProducts;