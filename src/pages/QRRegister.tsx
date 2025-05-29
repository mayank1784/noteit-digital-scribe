import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const QRRegister = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return; // Wait for auth state to load

    if (!notebookId) {
      toast({
        title: "Invalid QR Code",
        description: "The notebook ID is missing from the QR code",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    if (user) {
      // User is logged in, redirect to register-notebook with prefilled data
      navigate(
        `/register-notebook?notebookId=${notebookId}&nickname=${notebookId}`,
        { replace: true }
      );
    } else {
      // User is not logged in, store notebook ID and source in sessionStorage
      sessionStorage.setItem("pendingNotebookId", notebookId);
      sessionStorage.setItem("authSource", "notebook-registration");
      navigate("/login", {
        replace: true,
        state: { from: "qr-register" },
      });
    }
  }, [user, isLoading, notebookId, navigate, toast]);

  // Show loading while determining auth state
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
};

export default QRRegister;
