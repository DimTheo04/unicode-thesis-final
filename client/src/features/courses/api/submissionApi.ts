export interface FileNode {
  name: string;
  isDirectory: boolean;
  path: string;
  children?: FileNode[];
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  version: number;
  fileTreeJson: string; // JSON string of FileNode[]
  zipFilePath: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  hasSeenGrade: boolean;
  createdAt: string;
  updatedAt: string;
}

export const fetchMySubmission = async (token: string, assignmentId: string): Promise<Submission | null> => {
  const res = await fetch(`/api/assignments/${assignmentId}/submissions/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch submission');
  }
  const data = await res.json();
  return data;
};

export const submitAssignmentZip = async (token: string, assignmentId: string, file: File): Promise<Submission> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    let errMessage = 'Failed to submit assignment';
    try {
      const err = await res.json();
      errMessage = err.error?.message || err.message || errMessage;
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errMessage);
  }
  return res.json();
};

export const fetchAssignmentSubmissions = async (token: string, assignmentId: string): Promise<Submission[]> => {
  const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch submissions');
  return res.json();
};

export const fetchSubmissionFileContent = async (token: string, assignmentId: string, submissionId: string, filePath: string): Promise<string> => {
  const query = `?path=${encodeURIComponent(filePath)}`;
  const res = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/files${query}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch file content');
  }

  const data = await res.json();
  return data.content;
};

export const gradeSubmission = async (
  token: string,
  assignmentId: string,
  submissionId: string,
  grade: number,
  feedback: string
): Promise<Submission> => {
  const res = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ grade, feedback })
  });

  if (!res.ok) {
    let errMessage = 'Failed to grade submission';
    try {
      const err = await res.json();
      errMessage = err.error?.message || err.message || errMessage;
    } catch (e) {
      // ignore
    }
    throw new Error(errMessage);
  }
  return res.json();
};

export const markGradeAsSeen = async (token: string, assignmentId: string, submissionId: string): Promise<Submission> => {
  const res = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/seen-grade`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to mark grade as seen');
  return res.json();
};

export const analyzeCodeWithAI = async (token: string, submissionId: string, paths: string[]): Promise<string> => {
  const res = await fetch(`/api/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ submissionId, paths })
  });

  if (!res.ok) {
    let errMessage = 'Failed to analyze code';
    try {
      const err = await res.json();
      errMessage = err.error?.message || err.message || errMessage;
    } catch (e) {}
    throw new Error(errMessage);
  }
  const data = await res.json();
  return data.analysis;
};
