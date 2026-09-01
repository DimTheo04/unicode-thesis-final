import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Library, Plus, X, ArrowUpRight, UserCheck2, Trash2 } from 'lucide-react';
import { FormInput } from '@/components/shared/FormInput';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchCourses, createCourse, assignTeacher, removeTeacher } from '../api/courseApi';
import type { Course } from '../api/courseApi';
import { fetchTeachers } from '../../admin/api/adminApi';
import { useAuth } from '../../../contexts/AuthContext';

const courseSchema = z.object({
  code: z.string().min(2, 'Course code must be at least 2 characters').regex(/^\S+$/, 'Cannot contain spaces'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long'),
  description: z.string().optional()
});

export const CourseManagement: React.FC = () => {
  const { token, currentUser } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<z.infer<typeof courseSchema>>({ resolver: zodResolver(courseSchema) });

  const showFeedback = (err: string | null, succ: string | null = null) => {
    setErrorMessage(err);
    setSuccessMessage(succ);
    if (err || succ) {
      setTimeout(() => {
        setErrorMessage(null);
        setSuccessMessage(null);
      }, 4000);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchCourses(token!);
      setCourses(data);
      
      if (currentUser?.role === 'ADMIN') {
        const teachersData = await fetchTeachers(token!);
        setAvailableTeachers(teachersData);
      }
    } catch (err: any) {
      console.error(err);
      showFeedback(err.message || 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && currentUser) loadData();
  }, [token, currentUser?.role]);

  const onSubmitCreate = async (data: any) => {
    try {
      await createCourse(token!, data);
      setShowCreate(false);
      reset();
      showFeedback(null, 'Course created successfully.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showFeedback(err.message || 'Failed to create course. Please check if the course code is already taken.');
    }
  };

  const handleAssignTeacher = async (courseId: string) => {
    const teacherId = selectedTeacherId[courseId];
    if (!teacherId) return;
    try {
      await assignTeacher(token!, courseId, teacherId);
      showFeedback(null, 'Instructor assigned successfully.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showFeedback(err.message || 'Failed to assign instructor.');
    }
  };

  const handleRemoveTeacher = async (courseId: string, teacherId: string) => {
    try {
      await removeTeacher(token!, courseId, teacherId);
      showFeedback(null, 'Instructor removed successfully.');
      loadData();
    } catch (err: any) {
      console.error(err);
      showFeedback(err.message || 'Failed to remove instructor.');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-48 bg-secondary/50 border-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs font-bold hover:opacity-75 cursor-pointer p-0.5" aria-label="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs flex items-center justify-between">
          <span>{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-xs font-bold hover:opacity-75 cursor-pointer p-0.5" aria-label="Close">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground tracking-tight">
            {currentUser?.role === 'STUDENT' ? 'Enrolled Courses' : 'Course Management'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {currentUser?.role === 'STUDENT' ? 'Courses you have access to' : 'All academic courses in the platform'}
          </p>
        </div>
        {currentUser?.role === 'ADMIN' && (
          <Button
            onClick={() => setShowCreate(!showCreate)}
            variant={showCreate ? 'outline' : 'default'}
            size="sm"
          >
            {showCreate ? <X className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
            {showCreate ? 'Cancel' : 'New Course'}
          </Button>
        )}
      </div>
      
      {showCreate && currentUser?.role === 'ADMIN' && (
        <Card className="border-border p-5 bg-card">
          <h4 className="text-sm font-semibold text-foreground mb-4">Create New Course</h4>
          <form onSubmit={handleSubmit(onSubmitCreate)} className="space-y-4 max-w-md">
            <FormInput id="code" label="Course Code (e.g. CS-302)" registration={register("code")} required error={errors.code?.message as string} />
            <FormInput id="title" label="Course Title" registration={register("title")} required error={errors.title?.message as string} />
            <FormInput id="description" label="Description (Optional)" registration={register("description")} type="text" />
            <div className="flex gap-2">
              <Button type="submit" size="sm">Save Course</Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {courses.length === 0 ? (
        <Card className="border-border p-12 text-center">
          <Library className="w-8 h-8 text-foreground mx-auto mb-3 opacity-40" />
          <h4 className="text-sm font-semibold text-foreground">No Courses Found</h4>
          <p className="text-xs text-muted-foreground mt-1">There are no available courses to display.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => (
            <Card key={course.id} className="border-border flex flex-col justify-between hover:border-border/90 hover:shadow-sm transition-all shadow-xs bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="default" className="text-[10px] font-semibold tracking-wider">
                    {course.code}
                  </Badge>
                  {course.teachers && course.teachers.length > 0 && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate max-w-[140px]">
                      <UserCheck2 className="w-3.5 h-3.5 text-foreground shrink-0" />
                      <span className="truncate">{course.teachers.map(t => t.fullName).join(', ')}</span>
                    </span>
                  )}
                </div>
                <CardTitle className="text-sm font-semibold text-foreground line-clamp-1">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-0 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {course.description || 'No description provided for this course.'}
                </p>
                
                {currentUser?.role === 'ADMIN' && (
                  <div className="pt-3 border-t border-border/80 space-y-2">
                    <div className="text-[11px] font-medium text-muted-foreground">Instructors:</div>
                    {course.teachers?.map((t: any) => (
                      <div key={t.id} className="flex justify-between items-center text-xs bg-secondary/50 px-2 py-1 rounded-md border border-border/70">
                        <span className="font-medium text-foreground">{t.fullName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTeacher(course.id, t.id)}
                          className="text-destructive hover:text-destructive/80 p-0.5 rounded cursor-pointer"
                          title="Remove instructor"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-1.5 pt-1">
                      <select 
                        className="flex-1 bg-card border border-border text-xs rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-medium"
                        value={selectedTeacherId[course.id] || ''}
                        onChange={(e) => setSelectedTeacherId(prev => ({ ...prev, [course.id]: e.target.value }))}
                      >
                        <option value="">Select Instructor...</option>
                        {availableTeachers.map(t => (
                          <option key={t.id} value={t.id}>{t.fullName}</option>
                        ))}
                      </select>
                      <Button size="sm" onClick={() => handleAssignTeacher(course.id)} className="h-7 text-xs">
                        Assign
                      </Button>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full text-xs font-medium"
                  variant="outline"
                  onClick={() => navigate(`/courses/${course.id}/assignments`)}
                >
                  <span>Open Course</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
