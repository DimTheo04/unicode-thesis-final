export interface Course {
  id: string;
  code: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  teachers: { id: string; fullName: string; username: string; email: string }[];
  _count?: { enrollments: number };
}

const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const handleResponse = async (res: Response, defaultMessage: string) => {
  if (!res.ok) {
    let errMessage = defaultMessage;
    try {
      const err = await res.json();
      errMessage = err.error?.message || err.message || defaultMessage;
    } catch (e) {}
    throw new Error(errMessage);
  }
  return res.json();
};

export const fetchCourses = async (token: string): Promise<Course[]> => {
  const res = await fetch('/api/courses', { headers: getHeaders(token) });
  return handleResponse(res, 'Failed to fetch courses');
};

export const fetchAvailableCourses = async (token: string): Promise<(Course & { enrollmentStatus: string | null })[]> => {
  const res = await fetch('/api/courses/available', { headers: getHeaders(token) });
  return handleResponse(res, 'Failed to fetch available courses');
};

export const createCourse = async (token: string, data: { code: string; title: string; description?: string }): Promise<Course> => {
  const res = await fetch('/api/courses', {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Failed to create course');
};

export const updateCourse = async (token: string, id: string, data: { code?: string; title?: string; description?: string }): Promise<Course> => {
  const res = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(data),
  });
  return handleResponse(res, 'Failed to update course');
};

export const assignTeacher = async (token: string, courseId: string, teacherId: string): Promise<Course> => {
  const res = await fetch(`/api/courses/${courseId}/teachers`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ teacherId }),
  });
  return handleResponse(res, 'Failed to assign teacher');
};

export const removeTeacher = async (token: string, courseId: string, teacherId: string): Promise<Course> => {
  const res = await fetch(`/api/courses/${courseId}/teachers/${teacherId}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return handleResponse(res, 'Failed to remove teacher');
};
