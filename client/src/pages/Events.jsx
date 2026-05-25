import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, AlertCircle, Flame, Clock, ShoppingBag, Plus, Trash2 } from "lucide-react";
import api from "../services/api";
import { CardSkeleton } from "../components/SkeletonLoader";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const showToast = useToast();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvents(res.data);
      } catch (err) {
        console.error("Error loading events:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getCountdown = (endDate) => {
    const diff = new Date(endDate) - new Date();
    if (diff <= 0) return "Ended";
    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hrs}h ${mins}m left`;
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    try {
      await api.delete(`/events/${id}`);
      showToast("Event deleted.", "success");
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
    } catch (err) {
      showToast(err.message || "Failed to delete event.", "error");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-primary-950 tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Live Marketplace Events
          </h1>
          <p className="text-sm text-sage-500">
            Discover active bazaars, flash sales, and seasonal farm markets.
          </p>
        </div>

        {(user?.role === "farmer" || user?.role === "admin") && (
          <Link
            to="/event/create"
            className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-soft">
          <div className="w-16 h-16 rounded-full bg-stone-50 border border-stone-150 flex items-center justify-center text-stone-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-lg text-primary-950">No Active Events</h3>
            <p className="text-xs text-sage-500">
              No bazaar or flash sales are currently running.
            </p>
          </div>
          {(user?.role === "farmer" || user?.role === "admin") && (
            <Link
              to="/event/create"
              className="flex items-center gap-2 bg-primary-800 hover:bg-primary-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-soft transition-all mt-2"
            >
              <Plus className="w-4 h-4" />
              Create First Event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white border border-stone-200/60 rounded-3xl overflow-hidden flex flex-col hover:shadow-soft-lg hover:border-primary-200 transition-all duration-300 group"
            >
              {/* Banner Image */}
              <Link
                to={`/events/${event._id}`}
                className="relative block aspect-[4/3] overflow-hidden"
              >
                <img
                  src={
                    event.bannerImage ||
                    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt={event.title}
                />

                {/* Type badge */}
                <span className="absolute top-3 left-3 bg-primary-900 text-white text-[10px] px-2.5 py-1 rounded-full uppercase font-bold">
                  {event.type}
                </span>

                {/* Countdown badge */}
                <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {getCountdown(event.endDate)}
                </span>
              </Link>

              {/* Card Content */}
              <div className="p-4 flex flex-col flex-grow">
                <Link
                  to={`/events/${event._id}`}
                  className="font-bold text-sm text-primary-950 hover:text-primary-700 leading-tight"
                >
                  {event.title}
                </Link>

                <p className="text-xs text-sage-500 mt-1 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center gap-1 mt-2 text-xs text-sage-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{event.location}</span>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div className="text-[10px] text-sage-400 font-bold uppercase">
                    Active Market
                  </div>

                  <div className="flex items-center gap-2">
                    {(user?.role === "farmer" || user?.role === "admin") && (
                      <button
                        onClick={(e) => handleDelete(e, event._id)}
                        className="p-2 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                        title="Delete event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <Link
                      to={`/events/${event._id}`}
                      className="bg-primary-900 hover:bg-primary-950 text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      View Market
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;