import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Image,
  AlignLeft,
  Tag,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const EVENT_TYPES = [
  { value: "bazaar", label: "Bazaar", emoji: "🏪", desc: "Open-air market gathering" },
  { value: "hot_sale", label: "Hot Sale", emoji: "🔥", desc: "Limited-time price drops" },
  { value: "festival", label: "Festival", emoji: "🌾", desc: "Seasonal harvest celebration" },
  { value: "flash_sale", label: "Flash Sale", emoji: "⚡", desc: "Quick burst discount event" },
];

const Field = ({ label, icon: Icon, children, required }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-sage-400">
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-primary-950 placeholder-sage-300 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 transition-all duration-200 shadow-soft";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const showToast = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "bazaar",
    location: "",
    startDate: "",
    endDate: "",
    bannerImage: "",
  });

  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "bannerImage") setPreviewImage(value);
  };

  const handleTypeSelect = (value) => {
    setForm((prev) => ({ ...prev, type: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.location || !form.startDate || !form.endDate) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    if (new Date(form.endDate) <= new Date(form.startDate)) {
      showToast("End date must be after start date.", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.post("/events", form);
      showToast("Event created successfully!", "success");
      navigate("/events");
    } catch (err) {
      showToast(err.message || "Failed to create event.", "error");
    } finally {
      setSaving(false);
    }
  };

  const selectedType = EVENT_TYPES.find((t) => t.value === form.type);

  return (
    <div className="min-h-screen bg-beige-50/50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs text-sage-400 hover:text-primary-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-extrabold text-primary-950 tracking-tight flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-500" />
                Create Marketplace Event
              </h1>
              <p className="text-xs text-sage-400 mt-1">
                Publish a bazaar, sale, or festival visible to all marketplace shoppers.
              </p>
            </div>

            {/* Role badge */}
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-primary-50 border border-primary-100 text-primary-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              {user?.role === "admin" ? "👑 Admin" : "🌱 Farmer"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Card 1: Event Details ── */}
          <div className="bg-white border border-stone-200/60 rounded-2xl shadow-soft p-6 space-y-5">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-sage-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Event Details
            </h2>

            <Field label="Event Title" icon={null} required>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Harvest Weekend Bazaar"
                className={inputClass}
              />
            </Field>

            <Field label="Description" icon={AlignLeft} required>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Tell shoppers what this event is about — products, atmosphere, deals…"
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </Field>

            <Field label="Location" icon={MapPin} required>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Kirtipur Haat, Kathmandu"
                className={inputClass}
              />
            </Field>
          </div>

          {/* ── Card 2: Event Type ── */}
          <div className="bg-white border border-stone-200/60 rounded-2xl shadow-soft p-6 space-y-4">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-sage-400 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              Event Type
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeSelect(t.value)}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer select-none ${
                    form.type === t.value
                      ? "border-primary-500 bg-primary-50 shadow-soft"
                      : "border-stone-200 bg-white hover:border-primary-200 hover:bg-primary-50/30"
                  }`}
                >
                  <span className="text-2xl mb-1.5">{t.emoji}</span>
                  <span
                    className={`text-xs font-bold ${
                      form.type === t.value ? "text-primary-800" : "text-primary-950"
                    }`}
                  >
                    {t.label}
                  </span>
                  <span className="text-[10px] text-sage-400 mt-0.5 leading-tight">{t.desc}</span>
                  {form.type === t.value && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary-500 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ── Card 3: Schedule ── */}
          <div className="bg-white border border-stone-200/60 rounded-2xl shadow-soft p-6 space-y-5">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-sage-400 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" />
              Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Start Date & Time" required>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>
              <Field label="End Date & Time" required>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </Field>
            </div>

            {form.startDate && form.endDate && new Date(form.endDate) > new Date(form.startDate) && (
              <div className="bg-primary-50 border border-primary-100 text-primary-700 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                Duration:{" "}
                {(() => {
                  const ms = new Date(form.endDate) - new Date(form.startDate);
                  const hrs = Math.floor(ms / 3600000);
                  const days = Math.floor(hrs / 24);
                  return days > 0
                    ? `${days} day${days > 1 ? "s" : ""} ${hrs % 24}h`
                    : `${hrs}h ${Math.floor((ms % 3600000) / 60000)}m`;
                })()}
              </div>
            )}
          </div>

          {/* ── Card 4: Banner Image ── */}
          <div className="bg-white border border-stone-200/60 rounded-2xl shadow-soft p-6 space-y-5">
            <h2 className="text-[11px] font-extrabold uppercase tracking-widest text-sage-400 flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              Banner Image
              <span className="text-sage-300 normal-case font-normal tracking-normal text-[10px]">— optional</span>
            </h2>

            <Field label="Image URL">
              <input
                name="bannerImage"
                value={form.bannerImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className={inputClass}
              />
            </Field>

            {/* Preview */}
            <div
              className={`rounded-xl overflow-hidden border transition-all duration-300 ${
                previewImage ? "border-primary-200 h-44" : "border-dashed border-stone-200 h-28"
              } flex items-center justify-center bg-stone-50`}
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    setPreviewImage("");
                  }}
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-sage-300">
                  <Image className="w-8 h-8" />
                  <span className="text-xs">Paste a URL above to preview banner</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Summary strip ── */}
          {form.title && (
            <div className="bg-primary-900 text-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-soft-lg">
              <span className="text-2xl">{selectedType?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-primary-200 uppercase tracking-wider">
                  {selectedType?.label}
                </p>
                <p className="text-sm font-extrabold truncate">{form.title}</p>
                {form.location && (
                  <p className="text-[11px] text-primary-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {form.location}
                  </p>
                )}
              </div>
              {form.startDate && (
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-primary-300 uppercase font-bold">Starts</p>
                  <p className="text-xs font-semibold">
                    {new Date(form.startDate).toLocaleDateString("en-NP", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-sage-500 bg-white border border-stone-200 hover:bg-stone-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-800 hover:bg-primary-900 active:bg-primary-950 text-white shadow-soft transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Publish Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;