import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotebooks } from '@/hooks/useNotebooks';
import { User, Crown, BookOpen, Trash2, Sparkles, Download, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';

const Settings = () => {
  const { user, logout } = useAuth();
  const { notebooks, userPlan, deleteNotebook } = useNotebooks();

  const handleDeleteNotebook = (notebookId: string, nickname: string) => {
    if (confirm(`Are you sure you want to delete "${nickname}"? All notes will be lost.`)) {
      deleteNotebook(notebookId);
    }
  };

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

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

        {/* User Profile */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 gradient-bg rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-glow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl border-border/50">
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <Crown className="w-5 h-5 text-primary" />
              <span>Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-foreground">
                    {userPlan?.display_name || 'Free Plan'}
                  </span>
                  <Badge className={userPlan?.id === 'free' 
                    ? 'bg-secondary text-secondary-foreground' 
                    : 'gradient-bg text-primary-foreground'
                  }>
                    {userPlan?.id?.toUpperCase() || 'FREE'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {userPlan?.id === 'free' 
                    ? `${notebooks.length} of ${userPlan?.max_notebooks || 5} notebooks used`
                    : 'Unlimited notebooks'
                  }
                </p>
              </div>
              {userPlan?.id === 'free' && (
                <Button className="gradient-bg text-primary-foreground rounded-xl shadow-glow-sm hover:shadow-glow transition-all">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Usage Statistics</CardTitle>
            <CardDescription>Your Noteit activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">{notebooks.length}</div>
                <p className="text-muted-foreground text-sm mt-1">Registered Notebooks</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">
                  {notebooks.reduce((acc, nb) => acc + nb.total_pages, 0)}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Total Pages</p>
              </div>
              <div className="text-center p-4 bg-secondary/30 rounded-xl">
                <div className="text-3xl font-bold text-primary">
                  {user?.created_at ? Math.max(0, new Date().getFullYear() - new Date(user.created_at).getFullYear()) || '< 1' : 0}
                </div>
                <p className="text-muted-foreground text-sm mt-1">Years Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registered Notebooks */}
        <Card className="mb-6 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-foreground">
              <BookOpen className="w-5 h-5 text-primary" />
              <span>Registered Notebooks</span>
            </CardTitle>
            <CardDescription>Manage your registered notebooks</CardDescription>
          </CardHeader>
          <CardContent>
            {notebooks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No notebooks registered yet</p>
            ) : (
              <div className="space-y-3">
                {notebooks.map((notebook) => (
                  <div key={notebook.id} className="flex items-center justify-between p-4 bg-secondary/20 rounded-xl border border-border/30">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${getCategoryGradient(notebook.category_id)} rounded-xl flex items-center justify-center`}>
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{notebook.nickname}</p>
                        <p className="text-sm text-muted-foreground">
                          {notebook.title} • {notebook.total_pages} pages
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteNotebook(notebook.id, notebook.nickname)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-foreground">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-secondary/20 rounded-xl border border-border/30">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Export Data</p>
                  <p className="text-sm text-muted-foreground">Download all your notes and notebook data</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl border-border/50">Export</Button>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-destructive/10 rounded-xl border border-destructive/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
                Delete
              </Button>
            </div>

            <div className="pt-4 border-t border-border/30">
              <Button onClick={logout} variant="outline" className="w-full rounded-xl border-border/50 h-12">
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
