import React, { useState } from 'react';

const AdvanceList = ({ advances = [], drivers = [], formatDisplayDate }) => {
  const [filterDriverId, setFilterDriverId] = useState('');

  const filteredAdvances = advances.filter(advance =>
    (filterDriverId ? advance.driverId === Number(filterDriverId) : true)
  );

  const totalPendingAdvances = filteredAdvances.reduce((sum, advance) => sum + (advance.remainingAmount || 0), 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Anticipos Registrados</h2>
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
      </div>

      <div className="mb-4">
        <p className="text-lg font-semibold">Total Anticipos Pendientes: <span className="text-red-600">${totalPendingAdvances.toLocaleString()}</span></p>
      </div>

      {filteredAdvances.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chofer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descontado</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pendiente</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdvances.map((advance, idx) => {
                const driver = drivers.find(d => d.id === advance.driverId) || {};
                return (
                  <tr key={advance.id || idx}>
                    <td className="px-4 py-2 whitespace-nowrap">{formatDisplayDate(advance.date)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{driver.name || 'Chofer desconocido'}</td>
                    <td className="px-4 py-2 whitespace-nowrap">${(advance.amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-green-600">${(advance.paidAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-red-600 font-medium">${(advance.remainingAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{advance.description || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No hay anticipos registrados que coincidan con los filtros.</p>
      )}
    </div>
  );
};

export default AdvanceList;