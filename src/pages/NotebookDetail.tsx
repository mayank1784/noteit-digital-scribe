
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotebooks } from '@/hooks/useNotebooks';
import { ArrowLeft, Settings, Trash2, FileText } from 'lucide-react';
import Layout from '@/components/Layout';

const NotebookDetail = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const { getNotebook, categories, deleteNotebook } = useNotebooks();
  const navigate = useNavigate();

  const notebook = notebookId ? getNotebook(notebookId) : undefined;

  if (!notebook) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Notebook Not Found</h1>
          <p className="text-gray-600 mt-2">The requested notebook could not be found.</p>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getCategoryColor = (categoryId: string) => {
    const colors = {
      student: 'bg-purple-100 text-purple-800',
      business: 'bg-gray-100 text-gray-800',
      creative: 'bg-pink-100 text-pink-800',
      journal: 'bg-teal-100 text-teal-800',
      planner: 'bg-red-100 text-red-800'
    };
    return colors[categoryId as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || categoryId;
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this notebook? All notes will be lost.')) {
      deleteNotebook(notebook.id);
      navigate('/dashboard');
    }
  };

  // Generate page grid (6x8 = 48 pages typical)
  const pageGrid = Array.from({ length: notebook.total_pages }, (_, i) => i + 1);

  return (
    <Layout title={notebook.nickname}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{notebook.nickname}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge className={getCategoryColor(notebook.category_id)}>
                  {getCategoryName(notebook.category_id)}
                </Badge>
                <span className="text-gray-600">{notebook.title}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                min="1"
                max={notebook.total_pages}
                placeholder="Page number"
                className="px-3 py-2 border border-gray-300 rounded-md w-32"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const pageNum = parseInt((e.target as HTMLInputElement).value);
                    if (pageNum >= 1 && pageNum <= notebook.total_pages) {
                      navigate(`/page/${notebook.id}/${pageNum}`);
                    }
                  }
                }}
              />
              <span className="text-gray-600">of {notebook.total_pages} pages</span>
            </div>
          </CardContent>
        </Card>

        {/* Page Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-3">
              {pageGrid.map((pageNumber) => (
                <Link
                  key={pageNumber}
                  to={`/page/${notebook.id}/${pageNumber}`}
                  className="group"
                >
                  <div className="aspect-square bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex flex-col items-center justify-center p-2 hover-scale group">
                    <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-1" />
                    <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">
                      {pageNumber}
                    </span>
                    {/* TODO: Show note count indicator */}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotebookDetail;
