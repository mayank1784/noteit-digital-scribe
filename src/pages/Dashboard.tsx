
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNotebooks } from '@/hooks/useNotebooks';
import { Plus, BookOpen, Trash2, Calendar, QrCode } from 'lucide-react';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { user } = useAuth();
  const { notebooks, deleteNotebook } = useNotebooks();

  const getCategoryColor = (category: string) => {
    const colors = {
      student: 'bg-purple-100 text-purple-800',
      business: 'bg-gray-100 text-gray-800',
      creative: 'bg-pink-100 text-pink-800',
      journal: 'bg-teal-100 text-teal-800',
      planner: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Layout title="Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Notebooks</h1>
            <p className="text-gray-600 mt-1">
              {notebooks.length} of {user?.maxNotebooks} notebooks registered
            </p>
          </div>
          <Link to="/register-notebook">
            <Button className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              Register Notebook
            </Button>
          </Link>
        </div>

        {/* Usage Indicator */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Usage Overview</h3>
                <p className="text-gray-600">
                  {user?.plan === 'free' ? 'Free Plan' : 'Pro Plan'} - 
                  {notebooks.length}/{user?.maxNotebooks} notebooks used
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-bg transition-all duration-300"
                    style={{ 
                      width: `${(notebooks.length / (user?.maxNotebooks || 5)) * 100}%` 
                    }}
                  />
                </div>
                {user?.plan === 'free' && notebooks.length >= (user?.maxNotebooks || 5) && (
                  <Button variant="outline" size="sm">
                    Upgrade to Pro
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notebooks Grid */}
        {notebooks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Notebooks Yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by registering your first Noteit notebook. 
                Scan the QR code on your notebook cover to begin.
              </p>
              <Link to="/register-notebook">
                <Button className="gradient-bg">
                  <Plus className="w-4 h-4 mr-2" />
                  Register Your First Notebook
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <Card key={notebook.id} className="hover-scale group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">
                        {notebook.nickname}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-500">
                        {notebook.title}
                      </CardDescription>
                    </div>
                    <Badge className={getCategoryColor(notebook.category)}>
                      {notebook.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {/* Notebook Cover Placeholder */}
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-gray-400" />
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{notebook.totalPages} pages</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {notebook.lastUsed 
                          ? formatDate(notebook.lastUsed)
                          : formatDate(notebook.registeredAt)
                        }
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/notebook/${notebook.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          Open
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotebook(notebook.id)}
                        className="text-red-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
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
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest notebook interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notebooks
                  .sort((a, b) => new Date(b.lastUsed || b.registeredAt).getTime() - new Date(a.lastUsed || a.registeredAt).getTime())
                  .slice(0, 5)
                  .map((notebook) => (
                    <div key={notebook.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{notebook.nickname}</p>
                          <p className="text-xs text-gray-500">
                            {notebook.lastUsed ? 'Last used' : 'Registered'} {formatDate(notebook.lastUsed || notebook.registeredAt)}
                          </p>
                        </div>
                      </div>
                      <Link to={`/notebook/${notebook.id}`}>
                        <Button variant="ghost" size="sm">
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
