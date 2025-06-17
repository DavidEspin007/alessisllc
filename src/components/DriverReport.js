import React, { useState } from 'react';

const DriverReport = ({ drivers = [], routes = [], schedule = [], payrolls = [], formatDisplayDate, onSelectForPayroll, onViewProcessedPayroll }) => {
  const [expandedDriver, setExpandedDriver] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterDriverId, setFilterDriverId] = useState('');

  const calculateDriverStats = () => {
    return drivers
      .filter(driver => driver.status !== 'deleted')
      .filter(driver => filterDriverId ? driver.id === Number(filterDriverId) : true)
      .map(driver => {
        let driverTrips = schedule.filter(trip => 
          trip?.driverId === driver?.id && 
          (startDate ? trip.date >= startDate : true) && 
          (endDate ? trip.date <= endDate : true)
        );

        const tripsWithPaymentStatus = driverTrips.map(trip => {
          const paidPayroll = payrolls.find(payroll => 
            payroll.driverId === driver.id &&
            payroll.details.some(detailTrip => detailTrip.id === trip.id)
          );
          
          return { 
            ...trip, 
            isPaid: !!paidPayroll,
            paidPayrollId: paidPayroll ? paidPayroll.id : null
          };
        });

        const unpaidTrips = tripsWithPaymentStatus.filter(trip => !trip.isPaid);
        const paidTrips = tripsWithPaymentStatus.filter(trip => trip.isPaid);

        const totalUnpaidTripsCount = unpaidTrips.reduce((sum, trip) => sum + (trip.trips || 1), 0);
        const totalUnpaidPayment = unpaidTrips.reduce((sum, trip) => {
          const route = routes.find(r => r?.id === trip?.routeId) || {};
          return sum + ((route.driverPay || 0) * (trip.trips || 1)); // Usar driverPay
        }, 0);

        const totalPaidTripsCount = paidTrips.reduce((sum, trip) => sum + (trip.trips || 1), 0);
        const totalPaidPayment = paidTrips.reduce((sum, trip) => {
           const route = routes.find(r => r?.id === trip?.routeId) || {};
           return sum + ((route.driverPay || 0) * (trip.trips || 1)); // Usar driverPay
        }, 0);

        const totalTripsInPeriod = tripsWithPaymentStatus.reduce((sum, trip) => sum + (trip.trips || 1), 0);
        const totalPaymentInPeriod = tripsWithPaymentStatus.reduce((sum, trip) => {
             const route = routes.find(r => r?.id === trip?.routeId) || {};
             return sum + ((route.driverPay || 0) * (trip.trips || 1)); // Usar driverPay
          }, 0);

        // Calcular el saldo pendiente total para este chofer en este período
        const totalRemainingBalance = payrolls.filter(payroll =>
            payroll.driverId === driver.id &&
            payroll.isPartial &&
            payroll.details.some(detailTrip => 
                driverTrips.some(periodTrip => periodTrip.id === detailTrip.id)
            )
        ).reduce((sum, payroll) => sum + (payroll.remainingBalance || 0), 0);


        return {
          ...driver,
          totalTrips: totalTripsInPeriod, // Total de todos los viajes en el período
          totalPayment: totalPaymentInPeriod, // Total de pago de todos los viajes en el período
          totalUnpaidTripsCount,
          totalUnpaidPayment,
          totalPaidTripsCount,
          totalPaidPayment,
          totalRemainingBalance,
          trips: tripsWithPaymentStatus.map(trip => {
            const route = routes.find(r => r?.id === trip?.routeId) || {};
            return {
              ...trip,
              routeName: route.name || 'Ruta desconocida',
              costPerTrip: route.driverPay || 0, // Usar driverPay
              total: (route.driverPay || 0) * (trip.trips || 1) // Usar driverPay
            };
          })
        };
      });
  };

  const driverStats = calculateDriverStats();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reporte de Pagos a Choferes</h2>
        <div className="flex items-center space-x-4">
           <select
              value={filterDriverId}
              onChange={(e) => setFilterDriverId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los choferes</option>
              {drivers.filter(d => d.status !== 'deleted').map(driver => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
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

      <div className="mb-6">
        <p className="text-sm text-gray-600">
          {startDate || endDate ? `Mostrando resultados desde ${startDate ? formatDisplayDate(startDate) : 'el inicio'} hasta ${endDate ? formatDisplayDate(endDate) : 'la fecha actual'}` : 'Mostrando todos los registros'}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chofer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes (Período)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total a Pagar (Período)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes (Pagados)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pagado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes (Pendientes)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendiente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalle</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {driverStats.map((driver, index) => (
              <React.Fragment key={driver?.id || index}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{driver?.name || 'Chofer sin nombre'}</td>
                   <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {driver.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{driver.totalTrips}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${(driver.totalPayment || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">{driver.totalPaidTripsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">${(driver.totalPaidPayment || 0).toLocaleString()}</td>
                   <td className="px-6 py-4 whitespace-nowrap font-medium text-orange-600">{driver.totalUnpaidTripsCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-orange-600">${(driver.totalUnpaidPayment || 0).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <button
                       onClick={() => setExpandedDriver(expandedDriver === driver.id ? null : driver.id)}
                       className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                     >
                       Ver Detalle
                       <svg 
                         className={`w-4 h-4 ml-1 transform transition-transform ${
                           expandedDriver === driver.id ? 'rotate-180' : ''
                         }`} 
                         fill="none" 
                         viewBox="0 0 24 24" 
                         stroke="currentColor"
                       >
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                   </td>
                </tr>
                {expandedDriver === driver.id && (
                  <tr>
                    <td colSpan="9" className="p-4 bg-gray-100">
                      <h4 className="font-medium mb-3">Detalle de Viajes ({driver?.name || 'Chofer sin nombre'})</h4>
                      {driver.trips?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitario</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Pago</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {driver.trips.map((trip, tripIdx) => (
                                <tr key={trip.id || tripIdx}>
                                  <td className="px-3 py-2 whitespace-nowrap">{formatDisplayDate(trip.date)}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{trip.time}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{trip.routeName}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{trip.trips}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">${(trip.costPerTrip || 0).toLocaleString()}</td>
                                  <td className="px-3 py-2 whitespace-nowrap font-medium">${(trip.total || 0).toLocaleString()}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">
                                    <button
                                      onClick={() => !trip.isPaid ? onSelectForPayroll(driver.id, trip.date, trip.date) : onViewProcessedPayroll(trip.paidPayrollId)}
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        trip.isPaid ? 'bg-green-100 text-green-800 cursor-pointer hover:bg-green-200' : 'bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer'
                                      }`}
                                    >
                                      {trip.isPaid ? 'Pagado' : 'Pendiente'}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No hay registros de viajes para este chofer en el período seleccionado.</p>
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {driverStats.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay datos disponibles para el período seleccionado o chofer seleccionado.</p>
        </div>
      )}
    </div>
  );
};

export default DriverReport;