import React, { useState } from 'react';
import { useClinic } from '../../context/ClinicContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Truck,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const InventoryView = () => {
  const {
    inventoryItems,
    suppliers,
    purchaseOrders,
    setIsPurchaseOrderModalOpen,
    updateInventoryStock,
    addToast
  } = useClinic();

  const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'orders', 'suppliers'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);

  const filteredItems = inventoryItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lotNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCat;
  });

  const lowStockCount = inventoryItems.filter((itm) => itm.stock <= itm.minStock).length;
  const totalStockValuation = inventoryItems.reduce((acc, itm) => acc + itm.stock * itm.unitPrice, 0);

  const handleQuickStockAdjust = (item, delta) => {
    const nextStock = Math.max(0, item.stock + delta);
    updateInventoryStock(item.id, nextStock);
  };

  return (
    <div className="view-container">
      {/* Header */}
      <div className="view-header">
        <div>
          <div className="badge-wrapper" style={{ marginBottom: '0.4rem' }}>
            <span className="badge badge-teal">
              <Package size={13} style={{ marginRight: '4px' }} />
              Farmacia, Insumos Traumatológicos, Prótesis & Kinesiología
            </span>
          </div>
          <h1 className="view-title">Inventario, Stock & Proveedores</h1>
          <p className="view-subtitle">
            Control de materiales ortopédicos, implantes quirúrgicos, insumos de kinesiología y órdenes de compra.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsPurchaseOrderModalOpen(true)}
          >
            <Truck size={18} />
            Nueva Orden de Compra
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="dashboard-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Package size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Artículos en Catálogo</span>
            <span className="kpi-value">{inventoryItems.length} SKUs</span>
            <span className="kpi-meta text-muted">Implantes e insumos</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-warning">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Alertas Stock Crítico</span>
            <span className="kpi-value">{lowStockCount}</span>
            <span className="kpi-meta text-warning">Requieren reposición</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-mint">
            <DollarSign size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Valuación de Stock</span>
            <span className="kpi-value">${(totalStockValuation / 1000000).toFixed(2)}M</span>
            <span className="kpi-meta text-success">Inventario valorizado</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrapper kpi-teal">
            <Building2 size={22} />
          </div>
          <div className="kpi-content">
            <span className="kpi-label">Proveedores Activos</span>
            <span className="kpi-value">{suppliers.length}</span>
            <span className="kpi-meta text-muted">Ortopedias & Droguerías</span>
          </div>
        </div>
      </div>

      {/* Tabs and search */}
      <div className="filter-bar" style={{ justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('stock')}
          >
            <Package size={15} />
            Control de Stock ({inventoryItems.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('orders')}
          >
            <Truck size={15} />
            Órdenes de Compra ({purchaseOrders.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('suppliers')}
          >
            <Building2 size={15} />
            Padrón de Proveedores ({suppliers.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="search-box-inline">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar insumo, SKU o lote..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === 'stock' && (
            <select
              className="form-select"
              style={{ width: '180px', padding: '0.4rem 0.65rem', fontSize: '0.82rem' }}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Todas las Categorías</option>
              <option value="Implantes & Prótesis">Implantes & Prótesis</option>
              <option value="Insumos Kinesiología">Insumos Kinesiología</option>
              <option value="Ortopedia & Soporte">Ortopedia & Soporte</option>
              <option value="Insumos Traumatología">Insumos Traumatología</option>
            </select>
          )}
        </div>
      </div>

      {/* TAB 1: CONTROL DE STOCK */}
      {activeTab === 'stock' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">Existencias de Insumos y Materiales Médicos</h3>
              <p className="card-subtitle">Seguimiento de lotes, vencimientos y niveles de reorden</p>
            </div>
            {lowStockCount > 0 && (
              <span className="badge badge-warning">
                <AlertTriangle size={13} style={{ marginRight: '4px' }} />
                {lowStockCount} artículos bajo punto de reorden
              </span>
            )}
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU / Insumo</th>
                  <th>Categoría / Ubicación</th>
                  <th>Lote / Vencimiento</th>
                  <th>Stock Actual</th>
                  <th>Stock Mínimo</th>
                  <th>Precio Unit.</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'center' }}>Ajuste Rápido</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} style={{ background: isLow ? '#fffbeb' : 'transparent' }}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SKU: {item.sku} • {item.supplierName}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.category}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.location}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{item.lotNumber}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vto: {item.expirationDate}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '1.05rem', fontWeight: 800, color: isLow ? '#d97706' : 'var(--text-main)' }}>
                          {item.stock} u.
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {item.minStock} u.
                        </span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>${item.unitPrice?.toLocaleString()}</span>
                      </td>
                      <td>
                        <Badge variant={isLow ? 'pendiente' : 'confirmado'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            onClick={() => handleQuickStockAdjust(item, -1)}
                            title="Descontar 1 unidad utilizada"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
                            onClick={() => handleQuickStockAdjust(item, 1)}
                            title="Ingresar 1 unidad recibida"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ÓRDENES DE COMPRA */}
      {activeTab === 'orders' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 className="card-title">Órdenes de Compra y Pedidos a Proveedores</h3>
              <p className="card-subtitle">Seguimiento de compras, envíos y recepciones de insumos</p>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setIsPurchaseOrderModalOpen(true)}
            >
              <Plus size={15} />
              Emitir Orden de Compra
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>N° Orden</th>
                  <th>Proveedor</th>
                  <th>Fecha Emisión</th>
                  <th>Entrega Estimada</th>
                  <th>Líneas / Items</th>
                  <th>Total Compra</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.map((po) => (
                  <tr key={po.id}>
                    <td>
                      <span className="badge badge-teal" style={{ fontWeight: 800 }}>{po.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{po.supplierName}</div>
                    </td>
                    <td>{po.date}</td>
                    <td>{po.expectedDelivery || 'A coordinar'}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{po.itemsCount || po.items?.length || 1} ítems</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--c-dark)', fontSize: '0.95rem' }}>
                        ${po.totalAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <Badge variant="confirmado">{po.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PROVEEDORES */}
      {activeTab === 'suppliers' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Padrón de Proveedores Homologados</h3>
              <p className="card-subtitle">Ortopedias, droguerías y empresas de equipamiento médico habilitadas</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Proveedor / Razón Social</th>
                  <th>CUIT</th>
                  <th>Contacto / Teléfono</th>
                  <th>Rubro Principal</th>
                  <th>Tiempo Entrega</th>
                  <th>Calificación</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((sup) => (
                  <tr key={sup.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.92rem' }}>
                        {sup.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sup.address}</div>
                    </td>
                    <td>{sup.cuit}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sup.contactPerson}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sup.phone} • {sup.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-soft">{sup.category}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{sup.deliveryTimeDays} días</span>
                    </td>
                    <td>
                      <span className="badge badge-teal">⭐ {sup.rating}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
