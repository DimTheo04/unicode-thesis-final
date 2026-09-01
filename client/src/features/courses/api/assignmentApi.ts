export interface AssignmentAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  attachments: AssignmentAttachment[];
}

export const fetchAssignments = async (token: string, courseId: string): Promise<Assignment[]> => {
  const res = await fetch(`/api/courses/${courseId}/assignments`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
};

export const createAssignment = async (
  token: string, 
  courseId: string, 
  data: { title: string; description: string; dueDate: string }, 
  files: File[]
): Promise<Assignment> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('dueDate', data.dueDate);
  
  files.forEach(file => {
    formData.append('files', file);
  });

  const res = await fetch(`/api/courses/${courseId}/assignments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
      // Do NOT set Content-Type header when sending FormData; browser sets it with boundary
    },
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || 'Failed to create assignment');
  }

  return res.json();
};


export const updateAssignment = async (
  token: string, 
  courseId: string, 
  assignmentId: string,
  data: { title?: string; description?: string; dueDate?: string }, 
  files?: File[]
): Promise<Assignment> => {
  const formData = new FormData();
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.dueDate) formData.append('dueDate', data.dueDate);
  
  if (files) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  const res = await fetch(`/api/courses/${courseId}/assignments/${assignmentId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || errorData.message || 'Failed to update assignment');
  }

  return res.json();
};
