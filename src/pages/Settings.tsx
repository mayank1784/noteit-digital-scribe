
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotebooks } from '@/hooks/useNotebooks';
import { User, Crown, BookOpen, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

const Settings = () => {
  const { user, logout } = useAuth();
  const { notebooks, deleteNotebook } = useNotebooks();

  const handleDeleteNotebook = (notebookId: string, nickname: string) => {
    if (confirm(`Are you sure you want to delete "${nickname}"? All notes will be lost.`)) {
      deleteNotebook(notebookId);
    }
  };

  return (
    <Layout title="Settings">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        {/* User Profile */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-gray-600">{user?.email}</p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Subscription</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium">
                    {user?.plan === 'free' ? 'Free Plan' : 'Pro Plan'}
                  </span>
                  <Badge variant={user?.plan === 'free' ? 'secondary' : 'default'}>
                    {user?.plan?.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-gray-600">
                  {user?.plan === 'free' 
                    ? `${notebooks.length} of ${user.maxNotebooks} notebooks used`
                    : 'Unlimited notebooks'
                  }
                </p>
              </div>
              {user?.plan === 'free' && (
                <Button className="gradient-bg">
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Your Noteit.digital activity overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{notebooks.length}</div>
                <p className="text-gray-600">Registered Notebooks</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {notebooks.reduce((acc, nb) => acc + nb.totalPages, 0)}
                </div>
                <p className="text-gray-600">Total Pages</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {user ? new Date().getFullYear() - new Date(user.createdAt).getFullYear() || '< 1' : 0}
                </div>
                <p className="text-gray-600">Years Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registered Notebooks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Registered Notebooks</span>
            </CardTitle>
            <CardDescription>
              Manage your registered notebooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notebooks.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No notebooks registered yet</p>
            ) : (
              <div className="space-y-3">
                {notebooks.map((notebook) => (
                  <div key={notebook.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">{notebook.nickname}</p>
                      <p className="text-sm text-gray-600">
                        {notebook.title} • {notebook.totalPages} pages • {notebook.category}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotebook(notebook.id, notebook.nickname)}
                      className="text-red-600 hover:text-red-700"
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
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Export Data</p>
                <p className="text-sm text-gray-600">Download all your notes and notebook data</p>
              </div>
              <Button variant="outline">Export</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" className="text-red-600 hover:text-red-700">
                Delete
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={logout} variant="outline" className="w-full">
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
