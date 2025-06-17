export const users = [
  { id: 1, username: "admin", password: "adminpassword", role: "admin", driverId: null },
  { id: 2, username: "juanp", password: "password123", role: "driver", driverId: 1 }, // driverId corresponde al id del chofer en driverList
  { id: 3, username: "mariag", password: "password123", role: "driver", driverId: 2 }
];