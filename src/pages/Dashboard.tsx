import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotebooks } from '@/hooks/useNotebooks';
import { Plus, BookOpen, Trash2, Calendar, QrCode, Sparkles } from 'lucide-react';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const { notebooks, categories, userPlan, deleteNotebook } = useNotebooks();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const pendingNotebookId = sessionStorage.getItem("pendingNotebookId");
      const authSource = sessionStorage.getItem("authSource");

      if (pendingNotebookId && authSource === "notebook-registration") {
        sessionStorage.removeItem("pendingNotebookId");
        sessionStorage.removeItem("authSource");
        navigate(
          `/register-notebook?notebookId=${pendingNotebookId}&nickname=${pendingNotebookId}`,
          { replace: true }
        );
      }
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const getCategoryGradient = (categoryId: string) => {
    const gradients: Record<string, string> = {
      student: 'notebook-gradient-student',
      business: 'notebook-gradient-business',
      creative: 'notebook-gradient-creative',
      journal: 'notebook-gradient-journal',
      planner: 'notebook-gradient-planner'
    };
    return gradients[categoryId] || 'notebook-gradient-business';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const maxNotebooks = userPlan?.max_notebooks || 5;
  const planName = userPlan?.display_name || 'Free Plan';
  const usagePercent = (notebooks.length / maxNotebooks) * 100;

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Notebooks</h1>
            <p className="text-muted-foreground mt-1">
              {notebooks.length} of {maxNotebooks} notebooks registered
            </p>
          </div>
          <Link to="/register-notebook">
            <Button className="gradient-bg text-primary-foreground rounded-xl shadow-glow-sm hover:shadow-glow transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Register Notebook
            </Button>
          </Link>
        </div>

        {/* Usage Card */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground text-lg">Usage Overview</h3>
                <p className="text-muted-foreground">
                  {planName} - {notebooks.length}/{maxNotebooks} notebooks used
                </p>
              </div>
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="flex-1 sm:w-32 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-bg transition-all duration-500"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                {userPlan?.id === 'free' && notebooks.length >= maxNotebooks && (
                  <Button variant="outline" size="sm" className="rounded-xl border-primary/30 text-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notebooks Grid */}
        {notebooks.length === 0 ? (
          <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl text-center py-16">
            <CardContent>
              <div className="w-20 h-20 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Notebooks Yet
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Get started by registering your first Noteit notebook. 
                Scan the QR code on your notebook cover to begin.
              </p>
              <Link to="/register-notebook">
                <Button className="gradient-bg text-primary-foreground rounded-xl shadow-glow-sm hover:shadow-glow transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Notebook
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <Card key={notebook.id} className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl hover-scale group overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg text-foreground truncate">
                        {notebook.nickname}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {notebook.title}
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 ml-2">
                      {getCategoryName(notebook.category_id)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* Notebook Cover */}
                    <div className={`h-32 ${getCategoryGradient(notebook.category_id)} rounded-xl flex items-center justify-center shadow-lg`}>
                      <BookOpen className="w-12 h-12 text-white/80" />
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{notebook.total_pages} pages</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {notebook.last_used 
                          ? formatDate(notebook.last_used)
                          : formatDate(notebook.registered_at || new Date().toISOString())
                        }
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/notebook/${notebook.id}`} className="flex-1">
                        <Button variant="outline" className="w-full rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                          Open
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotebook(notebook.id)}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        {notebooks.length > 0 && (
          <Card className="mt-8 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>Your latest notebook interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notebooks
                  .sort((a, b) => new Date(b.last_used || b.registered_at || '').getTime() - new Date(a.last_used || a.registered_at || '').getTime())
                  .slice(0, 5)
                  .map((notebook) => (
                    <div key={notebook.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${getCategoryGradient(notebook.category_id)} rounded-xl flex items-center justify-center`}>
                          <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{notebook.nickname}</p>
                          <p className="text-xs text-muted-foreground">
                            {notebook.last_used ? 'Last used' : 'Registered'} {formatDate(notebook.last_used || notebook.registered_at || '')}
                          </p>
                        </div>
                      </div>
                      <Link to={`/notebook/${notebook.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 rounded-xl">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
