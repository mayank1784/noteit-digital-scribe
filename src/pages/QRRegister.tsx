
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const QRRegister = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    if (user) {
      // User is logged in, redirect to register-notebook with prefilled data
      navigate(`/register-notebook?notebookId=${notebookId}&nickname=${notebookId}`, { replace: true });
    } else {
      // User is not logged in, store notebook ID and redirect to register
      localStorage.setItem('pendingNotebookId', notebookId || '');
      navigate('/register', { replace: true });
    }
  }, [user, isLoading, notebookId, navigate]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
};

export default QRRegister;
