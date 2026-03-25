// existing user storage
const STORAGE_USERS = 'sims_faculty_users';
const STORAGE_LECTURES_PREFIX = 'sims_lectures_';

// new storage keys
const STORAGE_LEAVE_REQUESTS = 'sims_leave_requests';
const STORAGE_SWAP_REQUESTS = 'sims_swap_requests';

// ---- User functions (existing) ----
export const getUsers = () => {
  const raw = localStorage.getItem(STORAGE_USERS);
  return raw ? JSON.parse(raw) : [];
};

export const saveUsers = (users) => {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
};

// ---- Lecture functions (existing) ----
export const getLecturesForUser = (username) => {
  const key = STORAGE_LECTURES_PREFIX + username;
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

export const saveLecturesForUser = (username, lectures) => {
  const key = STORAGE_LECTURES_PREFIX + username;
  localStorage.setItem(key, JSON.stringify(lectures));
};

// ---- Leave request functions ----
export const getLeaveRequests = () => {
  const raw = localStorage.getItem(STORAGE_LEAVE_REQUESTS);
  return raw ? JSON.parse(raw) : [];
};

export const saveLeaveRequests = (requests) => {
  localStorage.setItem(STORAGE_LEAVE_REQUESTS, JSON.stringify(requests));
};

// ---- Swap request functions ----
export const getSwapRequests = () => {
  const raw = localStorage.getItem(STORAGE_SWAP_REQUESTS);
  return raw ? JSON.parse(raw) : [];
};

export const saveSwapRequests = (requests) => {
  localStorage.setItem(STORAGE_SWAP_REQUESTS, JSON.stringify(requests));
};