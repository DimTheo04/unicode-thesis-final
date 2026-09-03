
const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export interface EnrollmentRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  student: { id: string; fullName: string; username: string };
  course: { id: string; title: string; code: string };
  createdAt: string;
}

export const requestEnrollment = async (token: string, courseId: string) => {
  const res = await fetch('/api/enrollments/request', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ courseId }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || 'Failed to request enrollment');
  }
  return res.json();
};

export const fetchPendingEnrollments = async (token: string): Promise<EnrollmentRequest[]> => {
  const res = await fetch('/api/enrollments/pending', { headers: getHeaders(token) });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || 'Failed to fetch pending enrollments');
  }
  return res.json();
};

export const updateEnrollmentStatus = async (token: string, id: string, status: 'ACCEPTED' | 'REJECTED') => {
  const res = await fetch(`/api/enrollments/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || 'Failed to update enrollment status');
  }
  return res.json();
};
