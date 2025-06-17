import React, { useState, useEffect } from 'react';
import DriverForm from './components/DriverForm';
import RouteForm from './components/RouteForm';
import Calendar from './components/Calendar';
import DriverReport from './components/DriverReport';
import PayrollForm from './components/PayrollForm';
import PayrollReport from './components/PayrollReport';
import PayrollList from './components/PayrollList';
import Statistics from './components/Statistics';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import LoginForm from './components/LoginForm';
import AdvanceForm from './components/AdvanceForm';
import AdvanceList from './components/AdvanceList';
import { users as initialUsers } from './mock/users';
import { generateUsername, generatePassword } from './utils/authHelpers';

// Funciones helper para localStorage
const getStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Función para formatear fecha a MM/DD/YYYY
const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${month}/${day}/${year}`;
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(getStorage('currentUser', null));
  const [userList, setUserList] = useState(getStorage('userList', initialUsers));
  const [currentView, setCurrentView] = useState(getStorage('currentView', 'calendar'));
  const [driverList, setDriverList] = useState(getStorage('driverList', []));
  const [routeList, setRouteList] = useState(getStorage('routeList', []));
  const [scheduleList, setScheduleList] = useState(getStorage('scheduleList', []));
  const [payrolls, setPayrolls] = useState(getStorage('payrolls', []));
  const [expenseList, setExpenseList] = useState(getStorage('expenseList', []));
  const [advanceList, setAdvanceList] = useState(getStorage('advanceList', []));
  const [editingDriver, setEditingDriver] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [payrollReportData, setPayrollReportData] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [preselectedDriverId, setPreselectedDriverId] = useState('');
  const [preselectedStartDate, setPreselectedStartDate] = useState('');
  const [preselectedEndDate, setPreselectedEndDate] = useState('');
  const [expandedPayrollId, setExpandedPayrollId] = useState(null);
  const [selectedPayrollDriverId, setSelectedPayrollDriverId] = useState('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');


  // Sincronizar estado con localStorage
  useEffect(() => {
    setStorage('currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStorage('userList', userList);
  }, [userList]);

  useEffect(() => {
    setStorage('currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    setStorage('driverList', driverList);
  }, [driverList]);

  useEffect(() => {
    setStorage('routeList', routeList);
  }, [routeList]);

  useEffect(() => {
    setStorage('scheduleList', scheduleList);
  }, [scheduleList]);

  useEffect(() => {
    setStorage('payrolls', payrolls);
  }, [payrolls]);

  useEffect(() => {
    setStorage('expenseList', expenseList);
  }, [expenseList]);

  useEffect(() => {
    setStorage('advanceList', advanceList);
  }, [advanceList]);


  // Lógica de autenticación
  const handleLogin = (username, password) => {
    const foundUser = userList.find(u => u.username === username && u.password === password);
    if (foundUser) {
      setCurrentUser(foundUser);
      alert(`Bienvenido, ${foundUser.username}!`);
    } else {
      alert('Usuario o contraseña incorrectos.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    alert('Sesión cerrada.');
  };


  // Manejar choferes y usuarios asociados
  const handleSaveDriver = (driverData, userData) => {
    if (driverData.status === 'deleted') {
      setDriverList(prev => prev.filter(d => d.id !== driverData.id));
      setUserList(prev => prev.filter(u => u.driverId !== driverData.id));
    } else if (driverData.id && driverList.some(d => d.id === driverData.id)) {
      // Actualizar chofer existente
      setDriverList(prev => prev.map(d => d.id === driverData.id ? driverData : d));
      // Actualizar usuario asociado si se pasaron datos de usuario
      if (userData && userData.id) { // Si userData tiene ID, es una actualización
        setUserList(prev => prev.map(u => u.id === userData.id ? userData : u));
      }
    } else {
      // Crear nuevo chofer
      setDriverList(prev => [...prev, driverData]);
      // Crear nuevo usuario asociado
      if (userData) {
        const newUser = {
          id: Date.now() + 1,
          username: userData.username,
          password: userData.password,
          role: 'driver',
          driverId: driverData.id
        };
        setUserList(prev => [...prev, newUser]);
      }
    }
    setEditingDriver(null);
  };

  // Manejar rutas
  const handleSaveRoute = (route) => {
    if (route.status === 'deleted') {
      setRouteList(prev => prev.filter(r => r.id !== route.id));
    } else if (route.id && routeList.some(r => r.id === route.id)) {
      setRouteList(prev => prev.map(r => r.id === route.id ? route : r));
    } else {
      setRouteList(prev => [...prev, route]);
    }
    setEditingRoute(null);
  };

  // Manejar calendario (agregar o actualizar viaje)
  const handleAddOrUpdateSchedule = (trip) => {
    if (trip.id && scheduleList.some(t => t.id === trip.id)) {
      setScheduleList(prev => prev.map(t => t.id === trip.id ? trip : t));
    } else {
      setScheduleList(prev => [...prev, trip]);
    }
  };

  // Manejar gastos
  const handleAddExpense = (expense) => {
    setExpenseList(prev => [...prev, expense]);
  };


  // Generar reporte de nómina (solo viajes no pagados)
  const handleGeneratePayrollReport = (reportData) => {
    setPayrollReportData(reportData);
  };

  // Procesar pago de nómina
  const handleProcessPayment = (reportData) => {
    if (!reportData || reportData.trips.length === 0) {
      alert('No hay viajes para procesar en esta nómina.');
      return;
    }

    const { driver, trips, expenses, advancesToDeduct, totalGrossPayment, totalExpenses, totalAdvancesDeducted, totalNetPayment, startDate, endDate } = reportData;

    // Asegurarse de que los detalles de los viajes incluyan costPerTrip y total
    const processedTripDetails = trips.map(trip => {
      const route = routeList.find(r => r.id === trip.routeId) || {};
      return {
        ...trip,
        routeName: route.name || 'Ruta desconocida',
        costPerTrip: route.driverPay || 0, // Usar driverPay como valor unitario
        total: (route.driverPay || 0) * (trip.trips || 1)
      };
    });

    const newPayroll = {
      id: Date.now(),
      payrollNumber: payrolls.length + 1,
      emissionDate: new Date().toISOString().split('T')[0],
      driverId: driver.id,
      driverName: driver.name,
      startDate: startDate,
      endDate: endDate,
      totalGrossPayment: totalGrossPayment,
      totalExpenses: totalExpenses,
      totalAdvancesDeducted: totalAdvancesDeducted,
      totalNetPayment: totalNetPayment,
      details: processedTripDetails, // Usar los detalles procesados
      expenseDetails: expenses,
      advanceDeductionDetails: advancesToDeduct
    };

    setPayrolls(prev => [...prev, newPayroll]);
    setPayrollReportData(null);
    alert(`Nómina #${newPayroll.payrollNumber} procesada para ${newPayroll.driverName}. Monto neto pagado: $${newPayroll.totalNetPayment.toLocaleString()}`);

    const paidExpenseIds = expenses.map(exp => exp.id);
    setExpenseList(prev => prev.map(exp =>
      paidExpenseIds.includes(exp.id) ? { ...exp, isPaid: true, payrollNumber: newPayroll.payrollNumber } : exp
    ));

    advancesToDeduct.forEach(deductedAdvance => {
      setAdvanceList(prev => prev.map(adv =>
        adv.id === deductedAdvance.id
          ? {
              ...adv,
              paidAmount: (adv.paidAmount || 0) + deductedAdvance.deductedAmount,
              remainingAmount: (adv.remainingAmount || 0) - deductedAdvance.deductedAmount
            }
          : adv
      ));
    });
  };

  // Función para cambiar de vista y cerrar el menú
  const changeView = (view) => {
    setCurrentView(view);
    setIsMenuOpen(false);
  };

  // Función para seleccionar chofer y fechas desde el reporte (para generar nómina)
  const handleSelectForPayroll = (driverId, startDate, endDate) => {
    setPreselectedDriverId(driverId);
    setPreselectedStartDate(startDate);
    setPreselectedEndDate(endDate);
    setExpandedPayrollId(null);
    changeView('payroll');
  };

  // Función para ver una nómina procesada específica
  const handleViewProcessedPayroll = (payrollId) => {
    setExpandedPayrollId(payrollId);
    setPreselectedDriverId('');
    setPreselectedStartDate('');
    setPreselectedEndDate('');
    setPayrollReportData(null);
    changeView('payroll');
  };

  // Función para manejar clic en fecha desde estadísticas
  const handleStatisticsDateClick = (date) => {
    setSelectedCalendarDate(date);
    changeView('calendar');
  };


  // Calcular total pagado al chofer seleccionado en la vista de nómina
  const totalPaidToSelectedPayrollDriver = selectedPayrollDriverId
    ? payrolls
        .filter(payroll => payroll.driverId === Number(selectedPayrollDriverId))
        .reduce((sum, payroll) => sum + (payroll.totalNetPayment || 0), 0)
    : 0;

  // Obtener el nombre del chofer seleccionado en la vista de nómina
  const selectedPayrollDriverName = selectedPayrollDriverId
    ? driverList.find(driver => driver.id === Number(selectedPayrollDriverId))?.name || 'Chofer desconocido'
    : '';

  // Calcular el total pagado a todos los choferes
  const totalPaidToAllDrivers = payrolls.reduce((sum, payroll) => sum + (payroll.totalNetPayment || 0), 0);

  // --- Lógica de filtrado por rol ---
  const filteredSchedule = currentUser && currentUser.role === 'driver'
    ? scheduleList.filter(trip => trip.driverId === currentUser.driverId)
    : scheduleList;

  const filteredPayrolls = currentUser && currentUser.role === 'driver'
    ? payrolls.filter(payroll => payroll.driverId === currentUser.driverId)
    : payrolls;

  const filteredExpenses = currentUser && currentUser.role === 'driver'
    ? expenseList.filter(expense => expense.driverId === currentUser.driverId)
    : expenseList;

  const filteredAdvances = currentUser && currentUser.role === 'driver'
    ? advanceList.filter(advance => advance.driverId === currentUser.driverId)
    : advanceList;
  // --- Fin lógica de filtrado por rol ---


  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header y navegación */}
      <header className="bg-blue-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center relative">
          <h1 className="text-2xl font-bold">ALESSI LLC Fleet Manager</h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">Hola, {currentUser.username} ({currentUser.role === 'admin' ? 'Administrador' : 'Chofer'})</span>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-blue-700 text-sm">Salir</button>

            {/* Menú desplegable principal */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                Menú
                <svg className={`w-4 h-4 ml-2 transform transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <nav className={`absolute top-full right-0 mt-2 bg-blue-700 rounded-lg shadow-lg z-10 ${isMenuOpen ? 'block' : 'hidden'} flex flex-col space-y-1 p-2 min-w-[150px]`}>
                <button 
                  onClick={() => changeView('calendar')}
                  className={`px-4 py-2 rounded-lg text-left ${currentView === 'calendar' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                >
                  Calendario
                </button>
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => changeView('drivers')}
                    className={`px-4 py-2 rounded-lg text-left ${currentView === 'drivers' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                  >
                    Choferes
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => changeView('routes')}
                    className={`px-4 py-2 rounded-lg text-left ${currentView === 'routes' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                  >
                    Rutas
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => changeView('reports')}
                    className={`px-4 py-2 rounded-lg text-left ${currentView === 'reports' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                  >
                    Reportes
                  </button>
                )}
                <button 
                  onClick={() => changeView('payroll')}
                  className={`px-4 py-2 rounded-lg text-left ${currentView === 'payroll' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                >
                  Nómina
                </button>
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => changeView('statistics')}
                    className={`px-4 py-2 rounded-lg text-left ${currentView === 'statistics' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                  >
                    Estadísticas
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => changeView('expenses')}
                    className={`px-4 py-2 rounded-lg text-left ${currentView === 'expenses' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                  >
                    Gastos
                  </button>
                )}
                {currentUser.role === 'admin' && (
                  <button 
                    onClick={() => changeView('advances')}
                    className={`px-4 py-2 rounded-lg text-left ${currentView === 'advances' ? 'bg-blue-600' : 'hover:bg-blue-500'}`}
                  >
                    Anticipos
                  </button>
                )}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-grow">
        {/* Vista actual */}
        {currentView === 'calendar' && (
          <Calendar 
            drivers={driverList.filter(d => d.status !== 'deleted')} 
            routes={routeList} 
            schedule={filteredSchedule} 
            onSchedule={handleAddOrUpdateSchedule} 
            formatDisplayDate={formatDisplayDate} 
            selectedCalendarDate={selectedCalendarDate} 
            setSelectedCalendarDate={setSelectedCalendarDate} 
            currentUser={currentUser} 
          />
        )}

        {currentView === 'drivers' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            {editingDriver ? (
              <DriverForm 
                driverToEdit={editingDriver} 
                onSave={handleSaveDriver} 
                onCancel={() => setEditingDriver(null)} 
              />
            ) : (
              <>
                <DriverForm onSave={handleSaveDriver} />
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Lista de Choferes</h2>
                  {driverList.filter(d => d.status !== 'deleted').length > 0 ? (
                    <div className="space-y-2">
                      {driverList.filter(d => d.status !== 'deleted').map(driver => (
                        <div key={driver.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-gray-600">{driver.license}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {driver.status === 'active' ? 'Activo' : 'Inactivo'}
                            </span>
                            <button
                              onClick={() => setEditingDriver(driver)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay choferes registrados</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {currentView === 'routes' && currentUser.role === 'admin' && (
          <div className="space-y-6">
            {editingRoute ? (
              <RouteForm 
                routeToEdit={editingRoute} 
                onSave={handleSaveRoute} 
                onCancel={() => setEditingRoute(null)} 
              />
            ) : (
              <>
                <RouteForm onSave={handleSaveRoute} />
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold mb-4">Lista de Rutas</h2>
                  {routeList.filter(r => r.status !== 'deleted').length > 0 ? (
                    <div className="space-y-2">
                      {routeList.filter(r => r.status !== 'deleted').map(route => (
                        <div key={route.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">{route.name}</p>
                            <p className="text-sm text-gray-600">Costo Cliente: ${route.alessiCost?.toLocaleString()} - Pago Chofer: ${route.driverPay?.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => setEditingRoute(route)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Editar
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay rutas registradas</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {currentView === 'reports' && currentUser.role === 'admin' && (
          <DriverReport 
            drivers={driverList} 
            routes={routeList} 
            schedule={scheduleList} 
            payrolls={payrolls} 
            formatDisplayDate={formatDisplayDate} 
            onSelectForPayroll={handleSelectForPayroll} 
            onViewProcessedPayroll={handleViewProcessedPayroll} 
          />
        )}

        {currentView === 'payroll' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-semibold">Nómina</h2>
                 <div className="flex items-center space-x-4">
                    {selectedPayrollDriverId && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total pagado a {selectedPayrollDriverName}:</p>
                        <p className="text-xl font-bold text-green-600">${totalPaidToSelectedPayrollDriver.toLocaleString()}</p>
                      </div>
                    )}
                    {currentUser.role === 'admin' && (
                      <div className="text-right">
                         <p className="text-sm text-gray-600">Total pagado a todos los choferes:</p>
                         <p className="text-xl font-bold text-green-600">${totalPaidToAllDrivers.toLocaleString()}</p>
                      </div>
                    )}
                 </div>
              </div>
              {currentUser.role === 'admin' && (
                <PayrollForm 
                  drivers={driverList.filter(d => d.status !== 'deleted')} 
                  routes={routeList} 
                  schedule={scheduleList} 
                  payrolls={payrolls} 
                  expenseList={expenseList} 
                  advanceList={advanceList} 
                  onGenerateReport={handleGeneratePayrollReport} 
                  preselectedDriverId={preselectedDriverId}
                  preselectedStartDate={preselectedStartDate}
                  preselectedEndDate={preselectedEndDate}
                  setSelectedPayrollDriverId={setSelectedPayrollDriverId} 
                  currentUser={currentUser} 
                />
              )}
              <PayrollReport 
                reportData={payrollReportData} 
                onProcessPayment={handleProcessPayment} 
                formatDisplayDate={formatDisplayDate} 
                routes={routeList} 
              />
              <PayrollList 
                payrolls={filteredPayrolls} 
                drivers={driverList} 
                formatDisplayDate={formatDisplayDate} 
                expandedPayrollId={expandedPayrollId} 
                setExpandedPayrollId={setExpandedPayrollId} 
                setSelectedPayrollDriverId={setSelectedPayrollDriverId} 
                currentUser={currentUser} 
              />
            </div>
          )}

          {currentView === 'statistics' && currentUser.role === 'admin' && (
            <Statistics 
              drivers={driverList.filter(d => d.status !== 'deleted')} 
              routes={routeList} 
              schedule={scheduleList} 
              payrolls={payrolls} 
              onDateClick={handleStatisticsDateClick} 
              onSelectForPayroll={handleSelectForPayroll} 
              onViewProcessedPayroll={handleViewProcessedPayroll} 
            />
          )}

          {currentView === 'expenses' && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <ExpenseForm 
                drivers={driverList.filter(d => d.status !== 'deleted')} 
                onSave={handleAddExpense} 
              />
              <ExpenseList 
                expenses={filteredExpenses} 
                drivers={driverList} 
                formatDisplayDate={formatDisplayDate} 
              />
            </div>
          )}

          {currentView === 'advances' && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <AdvanceForm 
                drivers={driverList.filter(d => d.status !== 'deleted')} 
                onSave={handleAddAdvance} 
              />
              <AdvanceList 
                advances={filteredAdvances} 
                drivers={driverList} 
                formatDisplayDate={formatDisplayDate} 
              />
            </div>
          )}
        </main>

        {/* Footer con Copyright */}
        <footer className="bg-blue-800 text-white text-center p-4 mt-auto">
          <div className="container mx-auto text-sm">
            Copyright © 2025 ALESSI LLC.
          </div>
        </footer>
      </div>
    );
  };

  export default App;