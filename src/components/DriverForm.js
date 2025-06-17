import React, { useState, useEffect } from 'react';
import { generateUsername, generatePassword } from '../utils/authHelpers';

const DriverForm = ({ driverToEdit = null, onSave, onCancel, userToEdit = null }) => { // Recibir userToEdit
  const [driver, setDriver] = useState({ 
    name: '', 
    license: '', 
    status: 'active'
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Usar useEffect para cargar los datos del chofer y usuario cuando driverToEdit o userToEdit cambie
  useEffect(() => {
    if (driverToEdit) {
      setDriver(driverToEdit);
      // Si estamos editando, cargar el username y password del usuario asociado
      if (userToEdit) {
        setUsername(userToEdit.username);
        setPassword(userToEdit.password); // Cargar la contraseña actual (solo para edición)
      } else {
        setUsername('');
        setPassword('');
      }
    } else {
      // Limpiar el formulario y generar nuevo username/password para nuevo chofer
      setDriver({ name: '', license: '', status: 'active' });
      setUsername(''); // Se generará al escribir el nombre
      setPassword(generatePassword());
    }
  }, [driverToEdit, userToEdit]); // Dependencia: driverToEdit y userToEdit

  // Generar username automáticamente al escribir el nombre del chofer (solo para nuevo chofer)
  useEffect(() => {
    if (!driverToEdit && driver.name) {
      setUsername(generateUsername(driver.name));
    }
  }, [driver.name, driverToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDriver(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const driverData = { 
      ...driver,
      id: driverToEdit ? driverToEdit.id : Date.now()
    };

    if (!driverToEdit) {
      if (!username || !password) {
        alert('Por favor, ingresa un nombre de usuario y contraseña para el nuevo chofer.');
        return;
      }
      onSave(driverData, { username, password, role: 'driver' });
    } else {
      // Si es edición, pasar datos de usuario si se modificaron
      const userData = {
        id: userToEdit ? userToEdit.id : null, // ID del usuario existente
        username: username,
        password: password,
        role: 'driver',
        driverId: driverData.id
      };
      onSave(driverData, userData); // Pasar datos de usuario para actualización
    }

    if (!driverToEdit) {
       setDriver({ name: '', license: '', status: 'active' });
       setUsername('');
       setPassword(generatePassword());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {driverToEdit ? 'Editar Chofer' : 'Nuevo Chofer'}
        </h2>
        {driverToEdit && (
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
          value={driver.name}
          onChange={handleChange}
          placeholder="Nombre completo"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="license"
          value={driver.license}
          onChange={handleChange}
          placeholder="Licencia CDL"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="status"
          value={driver.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>

        {/* Campos de usuario para nuevo chofer o edición */}
        <>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nombre de usuario"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="text" // Cambiado a text para ver la contraseña al editar
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-sm text-gray-600 -mt-2">
            {driverToEdit ? 'Edita la contraseña si es necesario.' : 'Guarda esta contraseña para el chofer.'}
          </p>
        </>
        
        <div className="flex justify-end space-x-3">
          {driverToEdit && (
            <button
              type="button"
              onClick={() => onSave({ ...driver, status: 'deleted' }, null)}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
          )}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {driverToEdit ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default DriverForm;