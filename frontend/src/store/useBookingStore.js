import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  appointments: [],
  selectedSlot: null,
  isBookingModalOpen: false,
  availableSlots: [],

  setAvailableSlots: (slots) => set((state) => ({
    availableSlots: typeof slots === 'function' ? slots(state.availableSlots) : slots
  })),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setBookingModalOpen: (isOpen) => set({ isBookingModalOpen: isOpen }),

  addAppointment: (appointment) => set((state) => ({
    appointments: [...state.appointments, { ...appointment, id: Date.now(), status: 'pending' }]
  })),

  updateAppointmentStatus: (id, status) => set((state) => ({
    appointments: state.appointments.map(app => app.id === id ? { ...app, status } : app)
  })),
}));
