import React, { useState } from 'react';

const ExpenseForm = ({ drivers = [], onSave }) => {
  const [expense, setExpense] = useState({
    driverId: '',
    date: '',
    description: '',
    amount: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense.driverId || !expense.date || !expense.description || !expense.amount) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    onSave({
      ...expense,
      id: Date.now(),
      driverId: Number(expense.driverId),
      amount: Number(expense.amount)
    });
    setExpense({
      driverId: '',
      date: '',
      description: '',
      amount: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Registrar Gasto de Chofer</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <select
          name="driverId"
          value={expense.driverId}
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
          value={expense.date}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="description"
          value={expense.description}
          onChange={handleChange}
          placeholder="Descripción del gasto"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          name="amount"
          value={expense.amount}
          onChange={handleChange}
          placeholder="Monto ($)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          min="0"
        />
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Guardar Gasto
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;