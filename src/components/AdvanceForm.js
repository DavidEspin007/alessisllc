import React, { useState } from 'react';

const AdvanceForm = ({ drivers = [], onSave }) => {
  const [advance, setAdvance] = useState({
    driverId: '',
    date: '',
    amount: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdvance(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!advance.driverId || !advance.date || !advance.amount) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    onSave({
      ...advance,
      id: Date.now(),
      driverId: Number(advance.driverId),
      amount: Number(advance.amount),
      paidAmount: 0, // Cuánto se ha pagado/descontado de este anticipo
      remainingAmount: Number(advance.amount) // Cuánto queda por descontar
    });
    setAdvance({
      driverId: '',
      date: '',
      amount: '',
      description: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Registrar Anticipo</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          name="driverId"
          value={advance.driverId}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">Seleccionar Chofer</option>
          {drivers.filter(d => d.status !== 'deleted').map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="date"
          value={advance.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          name="amount"
          value={advance.amount}
          onChange={handleChange}
          placeholder="Monto del Anticipo ($)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          min="0"
        />
        <input
          type="text"
          name="description"
          value={advance.description}
          onChange={handleChange}
          placeholder="Descripción (opcional)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Guardar Anticipo
        </button>
      </div>
    </form>
  );
};

export default AdvanceForm;