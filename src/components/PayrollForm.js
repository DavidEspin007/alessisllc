import React, { useState, useEffect } from 'react';

const PayrollForm = ({ drivers = [], routes = [], schedule = [], payrolls = [], expenseList = [], advanceList = [], onGenerateReport, preselectedDriverId, preselectedStartDate, preselectedEndDate, setSelectedPayrollDriverId, currentUser }) => {
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Usar useEffect para cargar los valores preseleccionados o el chofer logueado
  useEffect(() => {
    if (preselectedDriverId) {
      setSelectedDriverId(preselectedDriverId.toString());
    } else if (currentUser && currentUser.role === 'driver' && currentUser.driverId) {
      setSelectedDriverId(currentUser.driverId.toString());
    }
    if (preselectedStartDate) {
      setStartDate(preselectedStartDate);
    }
    if (preselectedEndDate) {
      setEndDate(preselectedEndDate);
    }
  }, [preselectedDriverId, preselectedStartDate, preselectedEndDate, currentUser]);

  // Usar useEffect para notificar a App.js cuando cambie el chofer seleccionado
  useEffect(() => {
    setSelectedPayrollDriverId(selectedDriverId);
  }, [selectedDriverId, setSelectedPayrollDriverId]);

  const handleGenerate = () => {
    if (!selectedDriverId || !startDate || !endDate) {
      alert('Por favor, selecciona un chofer y un rango de fechas.');
      onGenerateReport(null);
      return;
    }
    
    const driver = drivers.find(d => d.id === Number(selectedDriverId));
    if (!driver) {
      alert('Chofer no encontrado.');
      onGenerateReport(null);
      return;
    }

    const driverTripsInRange = schedule.filter(trip =>
      trip.driverId === Number(selectedDriverId) &&
      trip.date >= startDate &&
      trip.date <= endDate
    );

    const unpaidTrips = driverTripsInRange.filter(trip =>
      !payrolls.some(payroll =>
        payroll.driverId === Number(selectedDriverId) &&
        payroll.details.some(detailTrip => detailTrip.id === trip.id)
      )
    );

    // Calcular el pago bruto por viajes
    const totalGrossPayment = unpaidTrips.reduce((sum, trip) => {
      const route = routes.find(r => r.id === trip.routeId) || {};
      return sum + ((route.driverPay || 0) * (trip.trips || 1));
    }, 0);

    // Calcular los gastos del chofer en el mismo período que NO han sido pagados
    const driverExpensesInPeriod = expenseList.filter(expense =>
      expense.driverId === Number(selectedDriverId) &&
      expense.date >= startDate &&
      expense.date <= endDate &&
      !expense.isPaid
    );
    const totalExpenses = driverExpensesInPeriod.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // Calcular anticipos pendientes de este chofer
    let advancesToDeduct = [];
    let totalAdvancesDeducted = 0;
    let remainingAdvancesBalance = totalGrossPayment; // Empezamos con el pago bruto

    // Iterar sobre los anticipos pendientes del chofer
    const pendingAdvances = advanceList.filter(adv => 
      adv.driverId === Number(selectedDriverId) && adv.remainingAmount > 0
    ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordenar por fecha para descontar los más antiguos primero

    pendingAdvances.forEach(adv => {
      if (remainingAdvancesBalance > 0) {
        const amountToDeduct = Math.min(remainingAdvancesBalance, adv.remainingAmount);
        totalAdvancesDeducted += amountToDeduct;
        remainingAdvancesBalance -= amountToDeduct;
        advancesToDeduct.push({ ...adv, deductedAmount: amountToDeduct });
      }
    });

    // Calcular el pago neto final (bruto - gastos - anticipos)
    const totalNetPayment = totalGrossPayment - totalExpenses - totalAdvancesDeducted;

    // Si no hay viajes pendientes Y no hay gastos pendientes Y no hay anticipos a descontar, no generar reporte
    if (unpaidTrips.length === 0 && driverExpensesInPeriod.length === 0 && totalAdvancesDeducted === 0) {
      alert('No hay viajes, gastos ni anticipos pendientes de pago para este chofer en el período seleccionado.');
      onGenerateReport(null);
      return;
    }

    // Pasar el objeto completo que PayrollReport espera
    onGenerateReport({
      driver: driver,
      trips: unpaidTrips,
      expenses: driverExpensesInPeriod,
      advancesToDeduct: advancesToDeduct, // Pasar los anticipos a descontar
      totalGrossPayment,
      totalExpenses,
      totalAdvancesDeducted, // Pasar el total de anticipos descontados
      totalNetPayment,
      startDate,
      endDate
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Generar Nómina</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={currentUser && currentUser.role === 'driver'}
        >
          {currentUser && currentUser.role === 'admin' && <option value="">Seleccionar Chofer</option>}
          {drivers.filter(d => d.status === 'active').map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Fecha Inicio"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Fecha Fin"
        />
        <button
          onClick={handleGenerate}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generar Reporte
        </button>
      </div>
    </div>
  );
};

export default PayrollForm;