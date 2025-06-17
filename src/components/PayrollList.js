import React, { useState, useEffect } from 'react';

const PayrollList = ({ payrolls = [], drivers = [], formatDisplayDate, expandedPayrollId, setExpandedPayrollId, setSelectedPayrollDriverId, currentUser }) => {
  const [filterDriverId, setFilterDriverId] = useState(() => {
    if (currentUser && currentUser.role === 'driver' && currentUser.driverId) {
      return currentUser.driverId.toString();
    }
    return '';
  });

  // Usar useEffect para notificar a App.js cuando cambie el chofer seleccionado en el filtro
  useEffect(() => {
    if (currentUser && currentUser.role === 'driver' && currentUser.driverId) {
      setSelectedPayrollDriverId(currentUser.driverId.toString());
    } else {
      setSelectedPayrollDriverId(filterDriverId);
    }
  }, [filterDriverId, setSelectedPayrollDriverId, currentUser]);


  const togglePayrollExpand = (payrollId) => {
    setExpandedPayrollId(expandedPayrollId === payrollId ? null : payrollId);
  };

  // Filtrar nóminas por ID de chofer seleccionado (o por el chofer logueado)
  const filteredPayrolls = (currentUser && currentUser.role === 'driver' && currentUser.driverId)
    ? payrolls.filter(payroll => payroll.driverId === currentUser.driverId)
    : (filterDriverId
      ? payrolls.filter(payroll => payroll.driverId === Number(filterDriverId))
      : payrolls);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Nóminas Procesadas</h2>
        {currentUser && currentUser.role === 'admin' && (
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
        )}
      </div>
      
      {filteredPayrolls.length > 0 ? (
        <div className="space-y-4">
          {filteredPayrolls.map((payroll, idx) => (
            <div key={payroll.id || idx} className="border border-gray-200 rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                onClick={() => togglePayrollExpand(payroll.id)}
              >
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div className="font-medium">#{payroll.payrollNumber}</div>
                  <div>{formatDisplayDate(payroll.emissionDate)}</div>
                  <div>{payroll.driverName}</div>
                  <div>{formatDisplayDate(payroll.startDate)} - {formatDisplayDate(payroll.endDate)}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Neto Pagado</p>
                    <p className="font-semibold">${(payroll.totalNetPayment || 0).toLocaleString()}</p>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      expandedPayrollId === payroll.id ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {expandedPayrollId === payroll.id && (
                <div className="p-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-3">Detalle de Viajes</h3>
                  {payroll.details?.length > 0 ? (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitario</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ruta</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payroll.details.map((trip, tripIdx) => (
                            <tr key={trip.id || tripIdx}>
                              <td className="px-3 py-2 whitespace-nowrap">{formatDisplayDate(trip.date)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{trip.time}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{trip.routeName || 'N/A'}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{trip.trips}</td>
                              <td className="px-3 py-2 whitespace-nowrap">${(trip.costPerTrip || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap font-medium">${(trip.total || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-6">No hay detalles de viajes para esta nómina.</p>
                  )}

                  {/* Sección de Gastos en el detalle de la nómina */}
                  <h3 className="text-lg font-semibold mb-3">Detalle de Gastos</h3>
                  {payroll.expenseDetails?.length > 0 ? (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payroll.expenseDetails.map((expense, idx) => (
                            <tr key={expense.id || idx}>
                              <td className="px-3 py-2 whitespace-nowrap">{formatDisplayDate(expense.date)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{expense.description}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-red-600 font-medium">-${(expense.amount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-6">No hay gastos registrados para esta nómina.</p>
                  )}

                  {/* Sección de Anticipos Descontados en el detalle de la nómina */}
                  <h3 className="text-lg font-semibold mb-3">Anticipos Descontados</h3>
                  {payroll.advanceDeductionDetails?.length > 0 ? (
                    <div className="overflow-x-auto mb-6">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Anticipo</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Anticipo</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Descontado</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payroll.advanceDeductionDetails.map((advance, idx) => (
                            <tr key={advance.id || idx}>
                              <td className="px-3 py-2 whitespace-nowrap">{formatDisplayDate(advance.date)}</td>
                              <td className="px-3 py-2 whitespace-nowrap">{advance.description || '-'}</td>
                              <td className="px-3 py-2 whitespace-nowrap">${(advance.amount || 0).toLocaleString()}</td>
                              <td className="px-3 py-2 whitespace-nowrap text-red-600 font-medium">-${(advance.deductedAmount || 0).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-6">No hay anticipos descontados en esta nómina.</p>
                  )}

                  {/* Totales finales en el detalle de la nómina */}
                  <div className="flex justify-end items-center space-x-8 mt-6">
                    <div className="text-right">
                      <p className="text-lg font-semibold">Total Bruto:</p>
                      <p className="text-2xl font-bold text-blue-600">${(payroll.totalGrossPayment || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Total Gastos:</p>
                      <p className="text-2xl font-bold text-red-600">-${(payroll.totalExpenses || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Total Anticipos:</p>
                      <p className="text-2xl font-bold text-red-600">-${(payroll.totalAdvancesDeducted || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">Total Neto Pagado:</p>
                      <p className="text-3xl font-bold text-green-600">${(payroll.totalNetPayment || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay nóminas procesadas que coincidan con la búsqueda.</p>
      )}
    </div>
  );
};

export default PayrollList;

// DONE