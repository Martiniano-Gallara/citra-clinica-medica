import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Truck, X, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const NewPurchaseOrderModal = () => {
  const {
    isPurchaseOrderModalOpen,
    setIsPurchaseOrderModalOpen,
    suppliers,
    inventoryItems,
    createPurchaseOrder
  } = useClinic();

  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [expectedDelivery, setExpectedDelivery] = useState('2026-09-02');
  const [items, setItems] = useState([
    { name: 'Cinta Kinesiotaping 5cm x 5m', qty: 10, unitPrice: 7500 },
    { name: 'Venda de Fibra de Vidrio 10cm', qty: 8, unitPrice: 12400 }
  ]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(5);
  const [newItemPrice, setNewItemPrice] = useState(8000);

  if (!isPurchaseOrderModalOpen) return null;

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || suppliers[0];

  const handleAddItem = () => {
    if (newItemName.trim()) {
      setItems([...items, { name: newItemName.trim(), qty: Number(newItemQty), unitPrice: Number(newItemPrice) }]);
      setNewItemName('');
      setNewItemQty(1);
    }
  };

  const handleRemoveItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const totalAmount = items.reduce((acc, itm) => acc + itm.qty * itm.unitPrice, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    createPurchaseOrder({
      supplierId: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      totalAmount,
      itemsCount: items.length,
      expectedDelivery,
      items
    });

    setIsPurchaseOrderModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsPurchaseOrderModalOpen(false)}>
      <div
        className="modal-content"
        style={{ maxWidth: '650px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div className="avatar-sm" style={{ background: 'var(--c-soft)', color: 'var(--c-dark)' }}>
              <Truck size={18} />
            </div>
            <div>
              <h3 className="modal-title">Emitir Orden de Compra a Proveedor</h3>
              <p className="modal-subtitle">Reabastecimiento de insumos y materiales ortopédicos</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsPurchaseOrderModalOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Proveedor Seleccionado</label>
                <select
                  className="form-select"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  required
                >
                  {suppliers.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} (CUIT {sup.cuit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fecha Estimada de Entrega</label>
                <input
                  type="date"
                  className="form-input"
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Item add builder */}
            <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Agregar Artículo a la Orden</label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nombre de insumo o prótesis..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Cantidad"
                  value={newItemQty}
                  onChange={(e) => setNewItemQty(e.target.value)}
                />
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  placeholder="Precio Unit."
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddItem}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <label className="form-label">Artículos Incluidos en la Orden ({items.length})</label>
              <div className="table-responsive">
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                      <th style={{ textAlign: 'center' }}>Quitar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((itm, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{itm.name}</td>
                        <td>{itm.qty} u.</td>
                        <td>${itm.unitPrice?.toLocaleString()}</td>
                        <td style={{ fontWeight: 700, color: 'var(--c-dark)' }}>
                          ${(itm.qty * itm.unitPrice).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="btn-icon"
                            style={{ color: '#ef4444' }}
                            onClick={() => handleRemoveItem(idx)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Total Orden de Compra:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--c-primary)' }}>
                ${totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setIsPurchaseOrderModalOpen(false)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={items.length === 0}>
              <CheckCircle2 size={16} />
              Confirmar y Enviar Orden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
