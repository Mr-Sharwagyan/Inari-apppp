import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { 
  Plus, Search, Edit3, Trash2, X, Sprout, Layers, Warehouse, 
  Calendar, Award, ClipboardList, Info, AlertTriangle, ArrowUpDown, ChevronDown, ChevronUp, History
} from 'lucide-react';
import { TableSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

const FarmerInventory = () => {
  const { user } = useAuth();
  const showToast = useToast();

  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedBatchId, setExpandedBatchId] = useState(null);

  // Modals
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Log Batch Form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [qualityGrade, setQualityGrade] = useState('A');
  const [location, setLocation] = useState('Silo A');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [savingLog, setSavingLog] = useState(false);

  // Adjust Batch Form
  const [adjustQuantity, setAdjustQuantity] = useState('');
  const [adjustType, setAdjustType] = useState('adjustment'); // 'harvest'|'sale'|'spoilage'|'adjustment'
  const [adjustNotes, setAdjustNotes] = useState('');
  const [adjustQuality, setAdjustQuality] = useState('');
  const [adjustLocation, setAdjustLocation] = useState('');
  const [savingAdjust, setSavingAdjust] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Farmer's Products (so they can select one to harvest/log batch)
      const prodRes = await api.get(`/products?farmer=${user._id}`);
      setProducts(prodRes.data);
      if (prodRes.data.length > 0) {
        setSelectedProductId(prodRes.data[0]._id);
      }

      // Load Inventory Batches
      const invRes = await api.get('/inventory');
      setBatches(invRes.data);
    } catch (err) {
      console.error('Inventory load error:', err);
      showToast('Failed to load inventory logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenLogModal = () => {
    if (products.length === 0) {
      showToast('Please register at least one crop product in the Catalog before logging a harvest batch.', 'warning');
      return;
    }
    
    // Autofill unique batch code
    const rand = Math.floor(1000 + Math.random() * 9000);
    setBatchNumber(`BAT-${new Date().getFullYear().toString().substring(2)}${String(new Date().getMonth() + 1).padStart(2, '0')}-${rand}`);
    
    const today = new Date().toISOString().split('T')[0];
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    const expiryStr = expiry.toISOString().split('T')[0];

    setHarvestDate(today);
    setExpiryDate(expiryStr);
    setQualityGrade('A');
    setLocation('Silo A');
    setQuantity('');
    setNotes('');
    setIsLogModalOpen(true);
  };

  const handleSaveLog = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !batchNumber || !quantity || !harvestDate || !expiryDate) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const prod = products.find(p => p._id === selectedProductId);
    if (!prod) return;

    setSavingLog(true);
    try {
      await api.post('/inventory', {
        product: selectedProductId,
        productName: prod.name,
        batchNumber,
        harvestDate,
        expiryDate,
        qualityGrade,
        location,
        quantity: parseFloat(quantity),
        notes: notes || `Initial harvest log for ${prod.name}`
      });
      showToast('Harvest batch logged and crop stock synced successfully.', 'success');
      setIsLogModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingLog(false);
    }
  };

  const handleOpenAdjustModal = (batch) => {
    setSelectedBatch(batch);
    setAdjustQuantity('');
    setAdjustType('adjustment');
    setAdjustNotes('');
    setAdjustQuality(batch.qualityGrade);
    setAdjustLocation(batch.location);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    if (!adjustQuantity || !adjustType) {
      showToast('Please specify adjustment amount and type.', 'warning');
      return;
    }

    setSavingAdjust(true);
    try {
      await api.put(`/inventory/${selectedBatch._id}`, {
        quantity: parseFloat(adjustQuantity),
        type: adjustType,
        notes: adjustNotes || `Stock adjustment (${adjustType})`,
        qualityGrade: adjustQuality,
        location: adjustLocation
      });
      showToast('Stock batch adjusted and master catalog synced.', 'success');
      setIsAdjustModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setSavingAdjust(false);
    }
  };

  const toggleExpandBatch = (id) => {
    setExpandedBatchId(expandedBatchId === id ? null : id);
  };

  const filteredBatches = batches.filter(b => 
    b.productName.toLowerCase().includes(search.toLowerCase()) ||
    b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.location.toLowerCase().includes(search.toLowerCase())
  );

  const getExpiryBadge = (expDateStr) => {
    const today = new Date();
    const exp = new Date(expDateStr);
    const diffTime = exp - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-extrabold uppercase bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
          <AlertTriangle className="w-3 h-3 shrink-0" /> Expired
        </span>
      );
    } else if (diffDays <= 7) {
      return (
        <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit animate-pulse">
          <AlertTriangle className="w-3 h-3 shrink-0" /> Expiring Soon ({diffDays}d)
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full w-fit">
          Fresh
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="text-left">
          <h2 className="text-2xl font-extrabold text-primary-950 tracking-tight">Silo Inventory Tracker</h2>
          <p className="text-xs text-sage-450 mt-0.5">Log harvests, track shelf life, and manage silo warehouse storage records.</p>
        </div>
        <button
          onClick={handleOpenLogModal}
          className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition-colors flex items-center gap-1.5 shrink-0 border border-primary-950/20"
        >
          <Plus className="w-4 h-4" />
          Log Harvest Batch
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative w-full max-w-sm bg-white border border-stone-200/60 p-3 rounded-2xl shadow-soft">
        <Search className="absolute left-6 top-6 w-4 h-4 text-sage-400" />
        <input
          type="text"
          placeholder="Search batches by crop name or batch ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-200 outline-none focus:border-primary-500"
        />
      </div>

      {/* Batch Ledger */}
      {loading ? (
        <TableSkeleton rows={4} cols={7} />
      ) : filteredBatches.length === 0 ? (
        <div className="bg-white border border-stone-200/60 p-12 rounded-3xl text-center space-y-3 shadow-soft flex flex-col items-center">
          <Layers className="w-10 h-10 text-sage-355 animate-bounce" />
          <div>
            <h3 className="font-bold text-base text-primary-950">No inventory batches logged</h3>
            <p className="text-xs text-sage-500">Record your crop harvests to build structural batch data, track expiration, and sync marketplace stocks.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/70 border-b border-stone-200/50 text-sage-500 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Batch Details</th>
                  <th className="p-4">Crop Name</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Quality</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-primary-950 font-medium">
                {filteredBatches.map((batch) => {
                  const isExpanded = expandedBatchId === batch._id;
                  const unit = products.find(p => p._id === batch.product)?.unit || 'kg';
                  return (
                    <React.Fragment key={batch._id}>
                      <tr className={`hover:bg-stone-50/30 transition-colors ${isExpanded ? 'bg-stone-50/30' : ''}`}>
                        <td className="p-4">
                          <button
                            onClick={() => toggleExpandBatch(batch._id)}
                            className="flex items-center gap-1.5 text-[10px] font-extrabold text-primary-850 hover:text-primary-950"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span className="font-mono bg-stone-100 px-2 py-0.5 rounded border text-stone-600">
                              {batch.batchNumber}
                            </span>
                          </button>
                        </td>
                        <td className="p-4 font-bold text-sm">{batch.productName}</td>
                        <td className="p-4 text-sm font-bold text-primary-900">
                          {batch.quantity.toLocaleString()} <span className="text-[10px] text-sage-400 font-normal">{unit}</span>
                        </td>
                        <td className="p-4 text-[10px] text-sage-500 space-y-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-primary-900">Harvest:</span> {new Date(batch.harvestDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-primary-900">Expiry:</span> {new Date(batch.expiryDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sage-600">
                            <Warehouse className="w-3.5 h-3.5 text-sage-400" />
                            <span>{batch.location}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                            batch.qualityGrade === 'A' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : batch.qualityGrade === 'B'
                              ? 'bg-primary-50 text-primary-800 border-primary-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            Grade {batch.qualityGrade}
                          </span>
                        </td>
                        <td className="p-4">
                          {getExpiryBadge(batch.expiryDate)}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleOpenAdjustModal(batch)}
                            className="bg-primary-50 hover:bg-primary-100 border border-primary-200/50 text-primary-900 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>

                      {/* Expandable History Ledger details row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan="8" className="bg-stone-50/50 border-t border-b border-stone-150/50 p-4">
                            <div className="space-y-3.5 pl-6">
                              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary-950 uppercase tracking-wider">
                                <History className="w-4 h-4 text-primary-650" />
                                <span>Batch Stock Ledger History</span>
                              </div>
                              <div className="relative border-l-2 border-primary-100 pl-4 space-y-4">
                                {batch.history && batch.history.map((hist, idx) => (
                                  <div key={idx} className="relative text-xs">
                                    {/* Timeline bullet dot */}
                                    <div className="absolute -left-[21px] top-1 bg-white border-2 border-primary-500 rounded-full w-2.5 h-2.5" />
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                          <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.25 rounded-md ${
                                            hist.type === 'harvest' 
                                              ? 'bg-emerald-100 text-emerald-800' 
                                              : hist.type === 'sale' 
                                              ? 'bg-sky-100 text-sky-700' 
                                              : hist.type === 'spoilage' 
                                              ? 'bg-red-100 text-red-700 font-extrabold'
                                              : 'bg-stone-200 text-stone-700'
                                          }`}>
                                            {hist.type}
                                          </span>
                                          <span className="font-bold text-primary-950">
                                            {hist.type === 'spoilage' || hist.type === 'sale' ? '-' : '+'}
                                            {hist.quantity.toLocaleString()} {unit}
                                          </span>
                                        </div>
                                        <div className="text-[10px] text-sage-450 italic">"{hist.notes}"</div>
                                      </div>
                                      <span className="text-[10px] text-sage-400 font-medium whitespace-nowrap">
                                        {new Date(hist.date || batch.createdAt).toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Log Harvest Batch */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsLogModalOpen(false)} className="fixed inset-0 bg-black/35 backdrop-blur-xs" />
          <div className="bg-white border border-stone-250 p-6 sm:p-8 rounded-3xl w-full max-w-lg shadow-xl relative z-10 space-y-5 animate-float duration-300">
            <button
              onClick={() => setIsLogModalOpen(false)}
              className="absolute right-4 top-4 text-sage-400 hover:text-sage-600 hover:bg-stone-100 p-1.5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-primary-950 border-b border-stone-100 pb-3 flex items-center gap-1.5">
              <Sprout className="w-5 h-5 text-primary-900" />
              <span>Log New Harvest Batch</span>
            </h3>

            <form onSubmit={handleSaveLog} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Crop Product *</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-semibold"
                    required
                  >
                    {products.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Batch Code *</label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-mono text-stone-700 bg-stone-50"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Harvest Date *</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Expiry Date *</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-sage-700">Harvest Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="250"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-bold"
                    required
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-sage-700">Quality Grade</label>
                  <select
                    value={qualityGrade}
                    onChange={(e) => setQualityGrade(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-semibold"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Processing)</option>
                  </select>
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-sage-700">Storage Silo</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Silo A"
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Silo Logger Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Clean grains, moisture level 12%"
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 h-16 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="border border-stone-200 text-sage-600 hover:text-primary-900 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingLog}
                  className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
                >
                  {savingLog ? 'Syncing Silo Stocks...' : 'Record Harvest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adjust Batch Quantity */}
      {isAdjustModalOpen && selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsAdjustModalOpen(false)} className="fixed inset-0 bg-black/35 backdrop-blur-xs" />
          <div className="bg-white border border-stone-250 p-6 sm:p-8 rounded-3xl w-full max-w-md shadow-xl relative z-10 space-y-5 animate-float duration-300">
            <button
              onClick={() => setIsAdjustModalOpen(false)}
              className="absolute right-4 top-4 text-sage-400 hover:text-sage-600 hover:bg-stone-100 p-1.5 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-primary-950 border-b border-stone-100 pb-3">
              Adjust Batch Stock: <span className="font-mono text-sm text-sage-500">{selectedBatch.batchNumber}</span>
            </h3>

            <div className="text-xs bg-beige-50 p-3.5 rounded-2xl border border-stone-150 text-sage-700 leading-relaxed">
              <strong>Crop:</strong> {selectedBatch.productName} <br />
              <strong>Current Warehouse Stock:</strong> {selectedBatch.quantity} {products.find(p => p._id === selectedBatch.product)?.unit || 'kg'}
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Adjustment Type *</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-semibold"
                    required
                  >
                    <option value="adjustment">Stock Audit (Adjustment)</option>
                    <option value="harvest">Extra Harvest Log (+)</option>
                    <option value="spoilage">Spoilage / Waste Deduct (-)</option>
                    <option value="sale">Direct Off-Market Sale (-)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Quantity Amount *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Amount to add/subtract"
                    value={adjustQuantity}
                    onChange={(e) => setAdjustQuantity(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Update Quality Grade</label>
                  <select
                    value={adjustQuality}
                    onChange={(e) => setAdjustQuality(e.target.value)}
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                  >
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Processing)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-sage-700">Update Silo / Storage</label>
                  <input
                    type="text"
                    value={adjustLocation}
                    onChange={(e) => setAdjustLocation(e.target.value)}
                    placeholder="Silo A"
                    className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-sage-700">Adjustment Note / Audit Reason *</label>
                <textarea
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Moisture levels caused rot / routine audit count"
                  className="w-full border border-stone-200 p-2.5 rounded-xl outline-none text-xs focus:border-primary-500 h-16 resize-none"
                  required
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="border border-stone-200 text-sage-600 hover:text-primary-900 px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAdjust}
                  className="bg-primary-900 hover:bg-primary-950 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-colors"
                >
                  {savingAdjust ? 'Saving Audit...' : 'Execute Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerInventory;
