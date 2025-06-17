import React, { useState, useEffect } from 'react';

const RouteForm = ({ routeToEdit = null, onSave, onCancel }) => {
  const [route, setRoute] = useState({ 
    name: '', 
    alessiCost: '', // Nuevo campo para el costo de ALESSI LLC
    driverPay: '',  // Nuevo campo para el pago al chofer
    duration: '' 
  });

  // Usar useEffect para cargar los datos de la ruta cuando routeToEdit cambie
  useEffect(() => {
    if (routeToEdit) {
      setRoute(routeToEdit);
    } else {
      // Limpiar el formulario si no hay ruta para editar
      setRoute({ name: '', alessiCost: '', driverPay: '', duration: '' });
    }
  }, [routeToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoute(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ 
      ...route,
      id: routeToEdit ? routeToEdit.id : Date.now(),
      alessiCost: Number(route.alessiCost), // Convertir a número
      driverPay: Number(route.driverPay)    // Convertir a número
    });
    // No limpiar el formulario aquí si estamos editando, se limpia en el el useEffect
    if (!routeToEdit) {
      setRoute({ name: '', alessiCost: '', driverPay: '', duration: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {routeToEdit ? 'Editar Ruta' : 'Nueva Ruta'}
        </h2>
        {routeToEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancelar
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <input
          type="text"
          name="name"
          value={route.name}
          onChange={handleChange}
          placeholder="Nombre de la ruta"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          name="alessiCost" // Nuevo campo
          value={route.alessiCost}
          onChange={handleChange}
          placeholder="Costo a Cliente (ALESSI LLC)"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="number"
          name="driverPay" // Nuevo campo
          value={route.driverPay}
          onChange={handleChange}
          placeholder="Pago a Chofer"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="duration"
          value={route.duration}
          onChange={handleChange}
          placeholder="Duración estimada"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        <div className="flex justify-end space-x-3">
          {routeToEdit && (
            <button
              type="button"
              onClick={() => onSave({ ...route, status: 'deleted' })}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {routeToEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RouteForm;