import React, { useState, useEffect } from 'react';

const Statistics = ({ drivers = [], routes = [], schedule = [], payrolls = [], onDateClick, onSelectForPayroll, onViewProcessedPayroll }) => {
  const [driverSalesData, setDriverSalesData] = useState([]);
  const [routeUsageData, setRouteUsageData] = useState([]);
  const [dailyShipmentsData, setDailyShipmentsData] = useState([]);
  const [expandedRoute, setExpandedRoute] = useState(null);
  const [startDate, setStartDate] = useState(''); // Nuevo estado para fecha inicio
  const [endDate, setEndDate] = useState(''); // Nuevo estado para fecha fin

  useEffect(() => {
    // Filtrar schedule por rango de fechas
    const filteredSchedule = schedule.filter(trip =>
      (startDate ? trip.date >= startDate : true) &&
      (endDate ? trip.date <= endDate : true)
    );

    // Calcular ventas por chofer (usando filteredSchedule)
    const driverSales = {};
    filteredSchedule.forEach(trip => {
      const driver = drivers.find(d => d.id === trip.driverId);
      const route = routes.find(r => r.id === trip.routeId);
      if (driver && route) {
        const revenue = (route.cost || 0) * (trip.trips || 1);
        driverSales[driver.name] = (driverSales[driver.name] || 0) + revenue;
      }
    });
    setDriverSalesData(Object.entries(driverSales).sort(([, a], [, b]) => b - a));

    // Calcular uso de rutas y agregar detalles (usando filteredSchedule)
    const routeUsage = {};
    filteredSchedule.forEach(trip => {
      const route = routes.find(r => r.id === trip.routeId);
      const driver = drivers.find(d => d.id === trip.driverId);
      if (route && driver) {
        if (!routeUsage[route.id]) {
          routeUsage[route.id] = {
            id: route.id,
            name: route.name,
            totalTrips: 0,
            details: []
          };
        }
        routeUsage[route.id].totalTrips += (trip.trips || 1);
        
        const isPaid = payrolls.some(payroll =>
          payroll.driverId === driver.id &&
          payroll.details.some(detailTrip => detailTrip.id === trip.id)
        );

        routeUsage[route.id].details.push({
          id: trip.id,
          driverId: driver.id,
          driverName: driver.name,
          date: trip.date,
          time: trip.time,
          trips: trip.trips || 1,
          totalValue: (route.cost || 0) * (trip.trips || 1),
          isPaid: isPaid,
          paidPayrollId: isPaid ? payrolls.find(p => p.details.some(dt => dt.id === trip.id)).id : null
        });
      }
    });
    const sortedRouteUsage = Object.values(routeUsage).sort((a, b) => b.totalTrips - a.totalTrips);
    setRouteUsageData(sortedRouteUsage);

    // Calcular envíos por fecha (usando filteredSchedule)
    const dailyShipments = {};
    filteredSchedule.forEach(trip => {
      dailyShipments[trip.date] = (dailyShipments[trip.date] || 0) + (trip.trips || 1);
    });
    const sortedDailyShipments = Object.entries(dailyShipments).sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
    setDailyShipmentsData(sortedDailyShipments);

  }, [drivers, routes, schedule, payrolls, startDate, endDate]); // Recalcular cuando cambien los datos o las fechas del filtro

  // Función simple para renderizar barras (simulación de gráfica)
  const renderBar = (value, maxValue, color) => {
    const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
      <div className="h-4" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
    );
  };

  const maxDriverSales = driverSalesData.length > 0 ? driverSalesData[0][1] : 1;
  const maxRouteUsage = routeUsageData.length > 0 ? routeUsageData[0].totalTrips : 1;
  const maxDailyShipments = dailyShipmentsData.length > 0 ? Math.max(...dailyShipmentsData.map(([, shipments]) => shipments)) : 1;

  const toggleRouteExpand = (routeId) => {
    setExpandedRoute(expandedRoute === routeId ? null : routeId);
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Estadísticas de Operación</h2>
        {/* Filtros de fecha */}
        <div className="flex items-center space-x-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg"
            placeholder="Desde"
          />
          <span>a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg"
            placeholder="Hasta"
          />
        </div>
      </div>

      {/* Gráfica de Ventas por Chofer */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Ventas por Chofer (Total)</h3>
        {driverSalesData.length > 0 ? (
          <div className="space-y-3">
            {driverSalesData.map(([driverName, sales]) => (
              <div key={driverName} className="flex items-center">
                <div className="w-32 text-sm">{driverName}</div>
                <div className="flex-1 bg-gray-200 rounded overflow-hidden">
                  {renderBar(sales, maxDriverSales, '#3B82F6')}
                </div>
                <div className="w-24 text-right text-sm font-medium">${sales.toLocaleString()}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay datos de ventas por chofer para el período seleccionado.</p>
        )}
      </div>

      {/* Gráfica de Uso de Rutas */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Uso de Rutas (Total Viajes)</h3>
        {routeUsageData.length > 0 ? (
          <div className="space-y-4">
            {routeUsageData.map((route) => (
              <div key={route.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div 
                  className="flex items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                  onClick={() => toggleRouteExpand(route.id)}
                >
                  <div className="w-32 text-sm font-medium">{route.name}</div>
                  <div className="flex-1 bg-gray-200 rounded overflow-hidden mr-4">
                    {renderBar(route.totalTrips, maxRouteUsage, '#10B981')}
                  </div>
                  <div className="w-24 text-right text-sm font-medium">{route.totalTrips} viajes</div>
                   <svg 
                     className={`w-5 h-5 text-gray-500 transform transition-transform ml-2 ${
                       expandedRoute === route.id ? 'rotate-180' : ''
                     }`} 
                     fill="none" 
                     viewBox="0 0 24 24" 
                     stroke="currentColor"
                   >
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                   </svg>
                </div>
                
                {/* Detalle de la ruta (se muestra si está expandida) */}
                {expandedRoute === route.id && (
                  <div className="p-4 border-t border-gray-200">
                    <h4 className="font-medium mb-3">Detalle de Viajes por Chofer</h4>
                    {route.details.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chofer</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitario</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ruta</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Pago</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {route.details.map((detail, detailIdx) => (
                              <tr key={detail.id || detailIdx}>
                                <td className="px-3 py-2 whitespace-nowrap">{detail.driverName}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{detail.date}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{detail.time}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{detail.trips}</td>
                                <td className="px-3 py-2 whitespace-nowrap">${detail.totalValue.toLocaleString()}</td>
                                <td className="px-3 py-2 whitespace-nowrap font-medium">${detail.totalValue.toLocaleString()}</td>
                                <td className="px-3 py-2 whitespace-nowrap">
                                   <button
                                     onClick={() => !detail.isPaid ? onSelectForPayroll(detail.driverId, detail.date, detail.date) : onViewProcessedPayroll(detail.paidPayrollId)}
                                     className={`px-2 py-1 text-xs rounded-full ${
                                       detail.isPaid ? 'bg-green-100 text-green-800 cursor-pointer hover:bg-green-200' : 'bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer'
                                     }`}
                                   >
                                     {detail.isPaid ? 'Pagado' : 'Pendiente'}
                                   </button>
                                 </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay detalles de viajes para esta ruta en el período seleccionado.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay datos de uso de rutas para el período seleccionado.</p>
        )}
      </div>

      {/* Gráfica de Envíos por Fecha */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Envíos por Fecha (Total Viajes)</h3>
        {dailyShipmentsData.length > 0 ? (
          <div className="space-y-3">
            {dailyShipmentsData.map(([date, shipments]) => (
              <div key={date} className="flex items-center">
                <button
                  onClick={() => onDateClick(date)}
                  className="w-32 text-sm text-left text-blue-600 hover:underline"
                >
                  {date}
                </button>
                <div className="flex-1 bg-gray-200 rounded overflow-hidden">
                  {renderBar(shipments, maxDailyShipments, '#F59E0B')}
                </div>
                <div className="w-24 text-right text-sm font-medium">{shipments} viajes</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No hay datos de envíos por fecha para el período seleccionado.</p>
        )}
      </div>
    </div>
  );
};

export default Statistics;

// DONE