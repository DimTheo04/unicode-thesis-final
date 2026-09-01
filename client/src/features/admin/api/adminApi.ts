export interface PendingUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export async function fetchPendingUsers(token: string): Promise<PendingUser[]> {
  const res = await fetch('/api/admin/pending-users', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to fetch pending registration requests');
  }

  return json.data;
}

export async function fetchTeachers(token: string): Promise<PendingUser[]> {
  const res = await fetch('/api/admin/teachers', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to fetch instructors');
  }

  return json.data;
}

export async function approveUserApi(
  token: string,
  userId: string,
  role: 'STUDENT' | 'TEACHER'
): Promise<{ message: string; user: PendingUser }> {
  const res = await fetch(`/api/admin/approve/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to approve user');
  }

  return json.data;
}

export async function rejectUserApi(token: string, userId: string): Promise<{ message: string }> {
  const res = await fetch(`/api/admin/reject/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error?.message || 'Failed to reject user request');
  }

  return json.data;
}
