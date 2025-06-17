import React, { useState, useEffect } from 'react';

const Calendar = ({ drivers = [], routes = [], schedule = [], onSchedule, formatDisplayDate, selectedCalendarDate, setSelectedCalendarDate, currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('08:00');
  const [assignment, setAssignment] = useState({ driverId: '', routeId: '', trips: 1, loadNumber: '' });
  const [editingTrip, setEditingTrip] = useState(null);

  // Usar useEffect para ir a la fecha seleccionada desde estadísticas
  useEffect(() => {
    if (selectedCalendarDate) {
      const [year, month, day] = selectedCalendarDate.split('-').map(Number);
      setCurrentDate(new Date(year, month - 1, day)); // Ajustar mes (0-index)
      setSelectedDate(selectedCalendarDate);
      setViewMode('day');
      setSelectedCalendarDate(''); // Limpiar la fecha seleccionada después de usarla
    }
  }, [selectedCalendarDate, setSelectedCalendarDate]);

  // Función para formatear fecha sin cambiar el día (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generar horas del día
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i < 10 ? `0${i}` : i;
    return `${hour}:00`;
  });

  // Vista mensual
  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    
    const days = [];
    
    // Espacios vacíos al inicio
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 border"></div>);
    }

    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDate(date.toISOString());
      const daySchedule = schedule.filter(item => item.date === dateStr);
      
      const tripCount = daySchedule.reduce((sum, trip) => sum + (trip.trips || 1), 0);
      
      days.push(
        <div 
          key={d} 
          className={`p-2 border min-h-16 cursor-pointer ${dateStr === selectedDate ? 'bg-blue-50' : ''}`}
          onClick={() => {
            setSelectedDate(dateStr);
            setViewMode('day');
          }}
        >
          <div className="flex justify-between">
            <span className={`text-sm ${dateStr === formatDate(new Date().toISOString()) ? 'font-bold text-blue-600' : ''}`}>
              {d}
            </span>
            {tripCount > 0 && (
              <span className="text-xs px-1 rounded bg-blue-100 text-blue-800">
                {tripCount} viaje{tripCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    );
  };

  // Vista diaria
  const renderDayView = () => {
    if (!selectedDate) return null;
    
    const daySchedule = schedule.filter(item => item.date === selectedDate);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          {formatDisplayDate(selectedDate)}
        </h3>

        {currentUser.role === 'admin' && ( // Solo admin puede ver el formulario de asignación
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
              <select
                value={editingTrip ? editingTrip.time : selectedTime}
                onChange={(e) => editingTrip ? setEditingTrip({...editingTrip, time: e.target.value}) : setSelectedTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hours.map(hour => (
                  <option key={hour} value={hour}>{hour}</option>
                ))}
              </select>
              
              <select
                name="driverId"
                value={editingTrip ? editingTrip.driverId : assignment.driverId}
                onChange={(e) => editingTrip ? setEditingTrip({...editingTrip, driverId: Number(e.target.value)}) : setAssignment({...assignment, driverId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar Chofer</option>
                {drivers.filter(d => d.status === 'active').map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name}
                  </option>
                ))}
              </select>
              
              <select
                name="routeId"
                value={editingTrip ? editingTrip.routeId : assignment.routeId}
                onChange={(e) => editingTrip ? setEditingTrip({...editingTrip, routeId: Number(e.target.value)}) : setAssignment({...assignment, routeId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar Ruta</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} (${(route.driverPay || 0).toLocaleString()})
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                name="loadNumber"
                value={editingTrip ? editingTrip.loadNumber : assignment.loadNumber}
                onChange={(e) => editingTrip ? setEditingTrip({...editingTrip, loadNumber: e.target.value}) : setAssignment({...assignment, loadNumber: e.target.value})}
                placeholder="Load Number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="trips"
                  value={editingTrip ? editingTrip.trips : assignment.trips}
                  onChange={(e) => editingTrip ? setEditingTrip({...editingTrip, trips: Number(e.target.value)}) : setAssignment({...assignment, trips: e.target.value})}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {editingTrip ? (
                   <div className="flex space-x-2">
                     <button
                       onClick={() => {
                         onSchedule(editingTrip);
                         setEditingTrip(null);
                         setAssignment({ driverId: '', routeId: '', trips: 1, loadNumber: '' });
                       }}
                       className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                     >
                       Actualizar
                     </button>
                     <button
                       onClick={() => setEditingTrip(null)}
                       className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                     >
                       Cancelar
                     </button>
                   </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!selectedDate || !assignment.driverId || !assignment.routeId) return;
                      
                      const newAssignment = {
                        id: Date.now(),
                        driverId: Number(assignment.driverId),
                        routeId: Number(assignment.routeId),
                        date: selectedDate,
                        time: selectedTime,
                        trips: Number(assignment.trips) || 1,
                        loadNumber: assignment.loadNumber,
                        status: 'assigned' // Estado inicial
                      };
                      
                      onSchedule(newAssignment);
                      setAssignment({ driverId: '', routeId: '', trips: 1, loadNumber: '' });
                    }}
                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Asignar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h4 className="font-medium mb-2">Viajes programados</h4>
          {daySchedule.length > 0 ? (
            <div className="space-y-2">
              {daySchedule.map((trip, i) => {
                const driver = drivers.find(d => d.id === trip.driverId) || {};
                const route = routes.find(r => r.id === trip.routeId) || {};
                return (
                  <div key={trip.id || i} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium">{driver.name || 'Chofer desconocido'}</p>
                      <p className="text-sm text-gray-600">
                        {trip.time} - {route.name || 'Ruta desconocida'} • {trip.trips} viaje{trip.trips !== 1 ? 's' : ''}
                        {trip.loadNumber && ` (Load: ${trip.loadNumber})`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">
                        ${((route.driverPay || 0) * (trip.trips || 1)).toLocaleString()}
                      </p>
                      {currentUser.role === 'admin' && ( // Admin puede editar
                        <button
                          onClick={() => setEditingTrip(trip)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Editar
                        </button>
                      )}
                      {currentUser.role === 'driver' && ( // Chofer puede cambiar estado
                        <button
                          onClick={() => onSchedule({ ...trip, status: trip.status === 'completed' ? 'assigned' : 'completed' })}
                          className={`px-2 py-1 text-xs rounded-full ${
                            trip.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {trip.status === 'completed' ? 'Completado' : 'Asignado'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No hay viajes programados para este día</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button 
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-lg ${viewMode === 'month' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
          >
            Mes
          </button>
          <button 
            onClick={() => selectedDate && setViewMode('day')}
            className={`px-3 py-1 rounded-lg ${viewMode === 'day' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            disabled={!selectedDate}
          >
            Día
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {viewMode === 'month' && renderMonthView()}
      {viewMode === 'day' && renderDayView()}
    </div>
  );
};

export default Calendar;