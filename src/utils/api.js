const API_BASE = 'http://localhost:3001/api';

// ==================== Users API ====================

export async function fetchUsers() {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function registerUser(name, employeeId, customAvatar = null) {
    const res = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, employeeId, customAvatar }),
    });
    if (!res.ok) throw new Error('Failed to register user');
    return res.json();
}

// ==================== Prizes API ====================

export async function fetchPrizes() {
    const res = await fetch(`${API_BASE}/prizes`);
    if (!res.ok) throw new Error('Failed to fetch prizes');
    return res.json();
}

export async function addPrize(prize) {
    const res = await fetch(`${API_BASE}/prizes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prize),
    });
    if (!res.ok) throw new Error('Failed to add prize');
    return res.json();
}

export async function updatePrize(id, updates) {
    const res = await fetch(`${API_BASE}/prizes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update prize');
    return res.json();
}

// ==================== Draw History API ====================

export async function fetchDrawHistory() {
    const res = await fetch(`${API_BASE}/draw-history`);
    if (!res.ok) throw new Error('Failed to fetch draw history');
    return res.json();
}

export async function addDrawHistory(record) {
    const res = await fetch(`${API_BASE}/draw-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
    });
    if (!res.ok) throw new Error('Failed to add draw history');
    return res.json();
}

export async function fetchWinnerIds() {
    const res = await fetch(`${API_BASE}/winner-ids`);
    if (!res.ok) throw new Error('Failed to fetch winner ids');
    return res.json();
}

// ==================== Reset API ====================

export async function resetAllData() {
    const res = await fetch(`${API_BASE}/reset`, {
        method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset data');
    return res.json();
}

export function exportWinners() {
    window.location.href = `${API_BASE}/export`;
}
