import React, { useState } from 'react';

const ExpenseList = ({ expenses = [], drivers = [], formatDisplayDate }) => {
  const [filterDriverId, setFilterDriverId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Filtrar gastos por chofer y rango de fechas
  const filteredExpenses = expenses.filter(expense =>
    (filterDriverId ? expense.driverId === Number(filterDriverId) : true) &&
    (startDate ? expense.date >= startDate : true) &&
    (endDate ? expense.date <= endDate : true)
  );

  // Calcular total de gastos filtrados
  const totalFilteredExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Registro de Gastos de Choferes</h2>
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

       <div className="mb-4">
         <p className="text-sm text-gray-600">
           {startDate || endDate || filterDriverId ? `Mostrando resultados ${filterDriverId ? `para ${drivers.find(d => d.id === Number(filterDriverId))?.name || 'chofer desconocido'}` : ''} ${startDate ? `desde ${formatDisplayDate(startDate)}` : ''} ${endDate ? `hasta ${formatDisplayDate(endDate)}` : ''}` : 'Mostrando todos los registros'}
         </p>
         <p className="text-lg font-semibold mt-2">Total de Gastos Filtrados: <span className="text-red-600">${totalFilteredExpenses.toLocaleString()}</span></p>
       </div>


      {filteredExpenses.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chofer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Pago</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nómina #</th> {/* Nueva columna */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense, idx) => {
                const driver = drivers.find(d => d.id === expense.driverId) || {};
                return (
                  <tr key={expense.id || idx}>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDisplayDate(expense.date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{driver.name || 'Chofer desconocido'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{expense.description}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium">-${expense.amount.toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        expense.isPaid ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {expense.isPaid ? 'Pagado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      {expense.isPaid && expense.payrollNumber ? `#${expense.payrollNumber}` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No hay gastos registrados que coincidan con los filtros.</p>
      )}
    </div>
  );
};

export default ExpenseList;

// DONE