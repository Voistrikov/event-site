import React, { useState } from 'react';
import './BookingCalendar.css';

interface BookingCalendarProps {
  checkIn: string;
  checkOut: string;
  bookedRanges?: { checkIn: string; checkOut: string; status: string }[];
  onDatesChange: (checkIn: string, checkOut: string) => void;
}

export default function BookingCalendar({ checkIn, checkOut, bookedRanges = [], onDatesChange }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startDate = checkIn ? new Date(checkIn) : null;
  const endDate = checkOut ? new Date(checkOut) : null;

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = clickedDate.toISOString().split('T')[0];

    if (!startDate || (startDate && endDate)) {
      onDatesChange(dateStr, '');
    } else if (clickedDate > startDate) {
      onDatesChange(checkIn, dateStr);
    } else {
      onDatesChange(dateStr, '');
    }
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const numDays = daysInMonth(year, month);
  const firstDay = (firstDayOfMonth(year, month) + 6) % 7; // Adjust to start on Monday

  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  return (
    <div className="booking-calendar-custom">
      <div className="calendar-nav">
        <button onClick={prevMonth}>&lt;</button>
        <span>{monthNames[month]} {year}</span>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className="calendar-grid-custom">
        {['Δ', 'Τ', 'Τ', 'Π', 'Π', 'Σ', 'Κ'].map(d => (
          <div key={d} className="calendar-day-header">{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}
        {Array.from({ length: numDays }, (_, i) => i + 1).map(day => {
          const date = new Date(year, month, day);
          const dateStr = date.toISOString().split('T')[0];
          
          let className = 'calendar-day';
          if (dateStr === checkIn) className += ' selected-start';
          if (dateStr === checkOut) className += ' selected-end';
          if (startDate && endDate && date > startDate && date < endDate) className += ' in-range';
          
          let bookingStatus = '';
          const isBooked = (bookedRanges || []).some(range => {
            if (!range || !range.checkIn || !range.checkOut) return false;
            try {
              const rangeStart = new Date(range.checkIn);
              const rangeEnd = new Date(range.checkOut);
              if (isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) return false;
              
              rangeStart.setHours(0,0,0,0);
              rangeEnd.setHours(0,0,0,0);
              const currentDate = new Date(date);
              currentDate.setHours(0,0,0,0);
              
              if (currentDate >= rangeStart && currentDate <= rangeEnd) {
                bookingStatus = range.status || 'CONFIRMED';
                return true;
              }
            } catch (e) {
              return false;
            }
            return false;
          });

          const isPast = date < new Date(new Date().setHours(0,0,0,0));
          if (isPast) className += ' past';
          if (isBooked) {
            className += ` booked status-${bookingStatus.toLowerCase()}`;
          }

          return (
            <div 
              key={day} 
              className={className}
              onClick={() => !isPast && !isBooked && handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="calendar-legend" style={{ display: 'flex', gap: '10px', marginTop: '15px', fontSize: '10px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}></div> Ελεύθερο
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#fffbeb', border: '1px dashed #fcd34d' }}></div> Σε αναμονή
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '10px', height: '10px', backgroundColor: '#fff1f1', border: '1px solid #fecaca' }}></div> Δεσμευμένο
        </div>
      </div>
    </div>
  );
}
