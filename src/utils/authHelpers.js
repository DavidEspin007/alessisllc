export const generateUsername = (name) => {
  if (!name) return '';
  const parts = name.toLowerCase().split(' ');
  if (parts.length > 1) {
    return `${parts[0]}${parts[1].charAt(0)}`;
  }
  return parts[0];
};

export const generatePassword = () => {
  // Genera una contraseña simple por defecto.
  // En un entorno real, se usaría una generación más robusta o se pediría al usuario.
  return "password123"; 
};