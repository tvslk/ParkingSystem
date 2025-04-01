'use client'

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import InterfaceButton from "@/app/components/Buttons/InterfaceButtons";
import { useParams } from 'next/navigation';
import ReservationStatusScreen from './ReservationStatusScreen';

interface Reservation {
  id: number;
  start_time: string;
  end_time: string;
}

function formatCustomDateTime(dateString: string): string {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()} ` +
         `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function ReservationManager() {
  const params = useParams();
  const spotId = params.id as string;
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReservations();
  }, [spotId]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(`/api/reservations/${spotId}`);
      if (!response.ok) throw new Error('Failed to load reservations');
      const data = await response.json();
      const activeReservations = data.filter(
        (r: Reservation) => new Date(r.end_time) > new Date()
      );
      setReservations(activeReservations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reservations');
    }
  };

  const isTimeBlocked = (date: Date) => {
    return reservations.some(reservation => {
      const start = new Date(reservation.start_time);
      const end = new Date(reservation.end_time);
      return date >= start && date <= end;
    });
  };

  const handleReservation = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!startDate || !endDate) {
        throw new Error('Please select both start and end times');
      }

      const conflict = reservations.some(r => {
        const existingStart = new Date(r.start_time);
        const existingEnd = new Date(r.end_time);
        return (
          (startDate < existingEnd && endDate > existingStart) ||
          (startDate >= existingStart && startDate <= existingEnd) ||
          (endDate >= existingStart && endDate <= existingEnd)
        );
      });

      if (conflict) throw new Error('Time conflict with existing reservation');

      const response = await fetch(`/api/reservations/${spotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Reservation failed');
      }

      await fetchReservations();
      setSuccess('Reservation created successfully');
      setStartDate(null);
      setEndDate(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        const response = await fetch(`/api/reservations/${spotId}?id=${reservationId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Cancellation failed');
        await fetchReservations();
        setSuccess('Reservation cancelled successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Cancellation failed');
      }
    }
  };

  // Hide status screen automatically after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  if (success || error) {
    return <ReservationStatusScreen success={success} error={error} />;
  }

  return (
    <div className="bg-zinc-100 rounded-2xl shadow-md p-6 space-y-6 h-full flex flex-col">
      <div className="text-lg text-gray-500 space-y-4 flex-grow">
      <h3 className="font-semibold text-gray-500">Select Reservation Time</h3>

        {/* Date/Time Picker */}
        <div className="bg-white shadow-lg rounded-lg p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2 text-gray-500">Start Time</label>
              <DatePicker
                selected={startDate}
                onChange={setStartDate}
                showTimeSelect
                dateFormat="dd.MM.yyyy HH:mm"
                minDate={new Date()}
                filterTime={(time) => !isTimeBlocked(time)}
                className="w-full p-2 rounded-lg border border-[#b9babb] bg-transparent"
                placeholderText="Select start time"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-500">End Time</label>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                showTimeSelect
                dateFormat="dd.MM.yyyy HH:mm"
                minDate={startDate || new Date()}
                filterTime={(time) => !isTimeBlocked(time)}
                className="w-full p-2 rounded-lg border border-[#b9babb] bg-transparent"
                placeholderText="Select end time"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <InterfaceButton
              label={loading ? 'Processing...' : 'Make Reservation'}
              onClick={handleReservation}
              disabled={loading || !startDate || !endDate}
            />
          </div>
        </div>

        {/* Active Reservations */}
        {reservations.length > 0 && (
          <div className="space-y-4 flex-grow overflow-auto">
            <h3 className="font-semibold">Active Reservations</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pb-4">
              {reservations.map(r => (
                <div key={r.id} className="bg-white p-3 rounded-lg shadow-lg">
                  {/* Reservation date & cancel button on the same row */}
                  <div className="flex items-center justify-between">
                    <p className="text-base px-3 font-large text-gray-500">
                      {formatCustomDateTime(r.start_time)} – {formatCustomDateTime(r.end_time)}
                    </p>
                    <InterfaceButton
                      label="Cancel"
                      onClick={() => handleCancel(r.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}