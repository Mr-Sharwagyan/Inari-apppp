import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon broken in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Recenter map when position changes
function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng]);
  return null;
}

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

const STATUS_META = {
  pending:    { label: "Order Placed",   color: "#f59e0b", bg: "#fffbeb" },
  processing: { label: "Being Packed",   color: "#8b5cf6", bg: "#f5f3ff" },
  shipped:    { label: "Out for Delivery",color: "#3b82f6", bg: "#eff6ff" },
  delivered:  { label: "Delivered",      color: "#16a34a", bg: "#f0fdf4" },
  cancelled:  { label: "Cancelled",      color: "#ef4444", bg: "#fef2f2" },
};

export default function DeliveryMap({ orderId: propOrderId }) {
  const { orderId: paramOrderId } = useParams();
  const orderId = propOrderId || paramOrderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const intervalRef = useRef(null);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem("inari_token");
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setOrder(data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Auto-refresh every 30s when order is in transit
    intervalRef.current = setInterval(() => {
      fetchOrder();
    }, 30000);
    return () => clearInterval(intervalRef.current);
  }, [orderId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <p style={{ color: "#64748b", marginTop: 12, fontSize: 14 }}>Loading delivery info…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, textAlign: "center", padding: 32 }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <p style={{ color: "#ef4444", fontWeight: 600, marginTop: 8 }}>{error}</p>
          <button onClick={fetchOrder} style={styles.refreshBtn}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const loc = order.deliveryLocation;
  const hasLocation = loc && loc.lat && loc.lng;
  const statusMeta = STATUS_META[order.orderStatus] || STATUS_META.pending;
  const currentStepIdx = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>🚚 Delivery Tracking</h2>
          <p style={styles.subtitle}>Order #{order._id.substring(0, 8).toUpperCase()}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: statusMeta.bg,
              color: statusMeta.color,
              border: `1px solid ${statusMeta.color}33`,
              borderRadius: 20,
              padding: "5px 14px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {statusMeta.label}
          </span>
          {lastRefreshed && (
            <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>
              Updated {lastRefreshed.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      {order.orderStatus !== "cancelled" && (
        <div style={styles.stepperWrap}>
          {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentStepIdx;
            const active = idx === currentStepIdx;
            return (
              <div key={step} style={styles.stepItem}>
                <div style={{
                  ...styles.stepCircle,
                  background: done ? "#16a34a" : "#e2e8f0",
                  boxShadow: active ? "0 0 0 4px #bbf7d0" : "none",
                }}>
                  {done ? "✓" : idx + 1}
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#0f1f10" : "#94a3b8",
                  marginTop: 4,
                  textAlign: "center",
                }}>
                  {STATUS_META[step].label}
                </span>
                {idx < STATUS_STEPS.length - 1 && (
                  <div style={{
                    ...styles.stepLine,
                    background: idx < currentStepIdx ? "#16a34a" : "#e2e8f0",
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Map or No-Location Placeholder */}
      {hasLocation ? (
        <div style={styles.mapWrap}>
          <MapContainer
            center={[loc.lat, loc.lng]}
            zoom={15}
            style={{ height: "100%", width: "100%", borderRadius: 16 }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[loc.lat, loc.lng]} icon={deliveryIcon}>
              <Popup>
                <div style={{ fontFamily: "sans-serif", minWidth: 160 }}>
                  <strong style={{ fontSize: 13 }}>🚚 Delivery Agent</strong>
                  <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>
                    Last updated:{" "}
                    {loc.updatedAt
                      ? new Date(loc.updatedAt).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              </Popup>
            </Marker>
            <RecenterMap lat={loc.lat} lng={loc.lng} />
          </MapContainer>
        </div>
      ) : (
        <div style={styles.noLocBox}>
          <span style={{ fontSize: 36 }}>📍</span>
          <p style={{ fontWeight: 600, color: "#0f1f10", marginTop: 8 }}>Live location not available yet</p>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
            The delivery agent hasn't shared their location for this order. Check back once it's shipped.
          </p>
        </div>
      )}

      {/* Delivery Details */}
      <div style={styles.detailsGrid}>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Recipient</span>
          <span style={styles.detailVal}>{order.shippingAddress?.fullName || "—"}</span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Phone</span>
          <span style={styles.detailVal}>{order.shippingAddress?.phone || "—"}</span>
        </div>
        <div style={{ ...styles.detailCard, gridColumn: "1 / -1" }}>
          <span style={styles.detailLabel}>Address</span>
          <span style={styles.detailVal}>
            {order.shippingAddress
              ? `${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`
              : "—"}
          </span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Payment</span>
          <span style={{ ...styles.detailVal, textTransform: "uppercase" }}>
            {order.paymentMethod} · {order.paymentStatus}
          </span>
        </div>
        <div style={styles.detailCard}>
          <span style={styles.detailLabel}>Total</span>
          <span style={{ ...styles.detailVal, color: "#16a34a", fontWeight: 800 }}>
            Rs. {order.totalAmount?.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Refresh */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <button onClick={fetchOrder} style={styles.refreshBtn}>
          🔄 Refresh Location
        </button>
        <p style={{ fontSize: 10, color: "#94a3b8", marginTop: 6 }}>
          Auto-refreshes every 30 seconds
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Outfit', 'Inter', sans-serif",
    maxWidth: 700,
    margin: "0 auto",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 16,
    padding: "16px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 16,
    padding: "16px 20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  title: { fontSize: 18, fontWeight: 800, color: "#0f1f10", margin: 0 },
  subtitle: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  stepperWrap: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 16,
    padding: "16px 24px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    position: "relative",
  },
  stepItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    transition: "all 0.3s",
  },
  stepLine: {
    position: "absolute",
    top: 14,
    left: "50%",
    width: "100%",
    height: 2,
    zIndex: 0,
    transition: "background 0.3s",
  },
  mapWrap: {
    height: 380,
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.07)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
  },
  noLocBox: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: 16,
    padding: "40px 24px",
    textAlign: "center",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  detailCard: {
    background: "#fff",
    border: "1px solid rgba(0,0,0,0.07)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
    boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  detailVal: {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f1f10",
  },
  refreshBtn: {
    background: "#0f1f10",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  loadingBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #16a34a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};