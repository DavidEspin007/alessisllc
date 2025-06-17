import React, { useState, useEffect } from 'react';

const PayrollReport = ({ reportData, onProcessPayment, formatDisplayDate, routes = [] }) => {
  const [editableAdvancesToDeduct, setEditableAdvancesToDeduct] = useState([]);

  useEffect(() => {
    if (reportData && reportData.advancesToDeduct) {
      setEditableAdvancesToDeduct(reportData.advancesToDeduct.map(adv => ({
        ...adv,
        deductedAmount: Math.min(adv.deductedAmount, adv.remainingAmount)
      })));
    } else {
      setEditableAdvancesToDeduct([]);
    }
  }, [reportData]);

  if (!reportData) return null;

  const { driver, trips, expenses, totalGrossPayment, totalExpenses, totalNetPayment, startDate, endDate } = reportData;

  const currentTotalAdvancesDeducted = editableAdvancesToDeduct.reduce((sum, adv) => sum + (adv.deductedAmount || 0), 0);
  const currentTotalNetPayment = totalGrossPayment - totalExpenses - currentTotalAdvancesDeducted;

  const handleDeductedAmountChange = (id, value) => {
    const newAmount = Number(value);
    setEditableAdvancesToDeduct(prev => prev.map(adv => {
      if (adv.id === id) {
        const maxDeductible = adv.amount - (adv.paidAmount || 0); 
        const validAmount = Math.max(0, Math.min(newAmount, maxDeductible)); 
        return { ...adv, deductedAmount: validAmount };
      }
      return adv;
    }));
  };

  const handleProcess = () => {
    onProcessPayment({
      ...reportData,
      advancesToDeduct: editableAdvancesToDeduct,
      totalAdvancesDeducted: currentTotalAdvancesDeducted,
      totalNetPayment: currentTotalNetPayment
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4">Resumen de Nómina</h2>
      
      <div className="mb-4">
        <p className="text-lg font-medium">{driver?.name || 'Chofer desconocido'}</p>
        <p className="text-sm text-gray-600">Período: {formatDisplayDate(startDate)} - {formatDisplayDate(endDate)}</p>
      </div>

      {/* Sección de Viajes */}
      <h3 className="text-lg font-semibold mb-3">Detalle de Viajes</h3>
      {trips?.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruta</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Viajes</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unitario</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ruta</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.map((trip, idx) => {
                // Buscar la ruta original para obtener el nombre y driverPay
                const originalRoute = routes.find(r => r.id === trip.routeId) || {};
                return (
                  <tr key={trip.id || idx}>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDisplayDate(trip.date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{trip.time}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{originalRoute.name || 'N/A'}</td> {/* Usar originalRoute.name */}
                    <td className="px-4 py-2 whitespace-nowrap">{trip.trips}</td>
                    <td className="px-4 py-2 whitespace-nowrap">${(originalRoute.driverPay || 0).toLocaleString()}</td> {/* Usar originalRoute.driverPay */}
                    <td className="px-4 py-2 whitespace-nowrap font-medium">${((originalRoute.driverPay || 0) * (trip.trips || 1)).toLocaleString()}</td> {/* Calcular total con originalRoute.driverPay */}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No hay viajes registrados para este chofer en el período seleccionado.</p>
      )}

      {/* Sección de Gastos */}
      <h3 className="text-lg font-semibold mb-3">Detalle de Gastos</h3>
      {expenses?.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense, idx) => (
                <tr key={expense.id || idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDisplayDate(expense.date)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{expense.description}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium">-${(expense.amount || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No hay gastos registrados para este chofer en el período seleccionado.</p>
      )}

      {/* Sección de Anticipos a Descontar */}
      <h3 className="text-lg font-semibold mb-3">Anticipos a Descontar</h3>
      {editableAdvancesToDeduct?.length > 0 ? (
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Anticipo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Anticipo</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Descontado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente Anticipo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editableAdvancesToDeduct.map((advance, idx) => (
                <tr key={advance.id || idx}>
                  <td className="px-4 py-2 whitespace-nowrap">{formatDisplayDate(advance.date)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{advance.description || '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">${(advance.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium">
                    <input
                      type="number"
                      value={advance.deductedAmount}
                      onChange={(e) => handleDeductedAmountChange(advance.id, e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                      min="0"
                      max={advance.amount - (advance.paidAmount || 0)}
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium">
                    ${(advance.amount - (advance.paidAmount || 0) - (advance.deductedAmount || 0)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mb-6">No hay anticipos a descontar para este chofer en el período seleccionado.</p>
      )}

      {/* Totales finales */}
      <div className="flex justify-end items-center space-x-8 mt-6">
        <div className="text-right">
          <p className="text-lg font-semibold">Total Bruto:</p>
          <p className="text-2xl font-bold text-blue-600">${(totalGrossPayment || 0).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Total Gastos:</p>
          <p className="text-2xl font-bold text-red-600">-${(totalExpenses || 0).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Total Anticipos:</p>
          <p className="text-2xl font-bold text-red-600">-${(currentTotalAdvancesDeducted || 0).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">Total Neto a Pagar:</p>
          <p className="text-3xl font-bold text-green-600">${(currentTotalNetPayment || 0).toLocaleString()}</p>
        </div>
        <button
          onClick={handleProcess}
          className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
        >
          Procesar Pago
        </button>
      </div>
    </div>
  );
};

export default PayrollReport;