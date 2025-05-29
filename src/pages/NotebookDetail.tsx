import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotebooks } from "@/hooks/useNotebooks";
import { ArrowLeft, Settings, Trash2, FileText, Users } from "lucide-react";
import Layout from "@/components/Layout";
import PageGroupManager from "@/components/PageGroupManager";
import { useToast } from "@/hooks/use-toast";

const NotebookDetail = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const { getNotebook, categories, deleteNotebook, getNotebookGroups } =
    useNotebooks();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");

  const notebook = notebookId ? getNotebook(notebookId) : undefined;
  const groups = notebookId ? getNotebookGroups(notebookId) : [];

  if (!notebook) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Notebook Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            The requested notebook could not be found.
          </p>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const getCategoryColor = (categoryId: string) => {
    const colors = {
      student: "bg-purple-100 text-purple-800",
      business: "bg-gray-100 text-gray-800",
      creative: "bg-pink-100 text-pink-800",
      journal: "bg-teal-100 text-teal-800",
      planner: "bg-red-100 text-red-800",
    };
    return (
      colors[categoryId as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this notebook? All notes will be lost."
      )
    ) {
      deleteNotebook(notebook.id);
      toast({ title: "Notebook Deleted" });
      navigate("/dashboard");
    }
  };

  // Generate page grid (6x8 = 48 pages typical)
  const pageGrid = Array.from(
    { length: notebook.total_pages },
    (_, i) => i + 1
  );

  const getPageGroups = (pageNumber: number) => {
    return groups.filter((group) => group.pages.includes(pageNumber));
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                {notebook.nickname}
              </h1>
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
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
                  if (e.key === "Enter") {
                    const pageNum = parseInt(
                      (e.target as HTMLInputElement).value
                    );
                    if (pageNum >= 1 && pageNum <= notebook.total_pages) {
                      navigate(`/page/${notebook.id}/${pageNum}`);
                    }
                  }
                }}
              />
              <span className="text-gray-600">
                of {notebook.total_pages} pages
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Pages and Groups */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pages" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>All Pages</span>
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Page Groups</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-3">
                  {pageGrid.map((pageNumber) => {
                    const pageGroups = getPageGroups(pageNumber);
                    return (
                      <Link
                        key={pageNumber}
                        to={`/page/${notebook.id}/${pageNumber}`}
                        className="group relative"
                      >
                        <div className="aspect-square bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 transition-colors flex flex-col items-center justify-center p-2 hover-scale group">
                          <FileText className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-1" />
                          <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">
                            {pageNumber}
                          </span>
                          {pageGroups.length > 0 && (
                            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                              {pageGroups.length}
                            </div>
                          )}
                        </div>
                        {pageGroups.length > 0 && (
                          <div className="absolute -bottom-6 left-0 right-0 text-center">
                            <div className="text-xs text-gray-500 truncate">
                              {pageGroups[0].name}
                              {pageGroups.length > 1 &&
                                ` +${pageGroups.length - 1}`}
                            </div>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <div className="space-y-6">
              <PageGroupManager
                notebookId={notebook.id}
                totalPages={notebook.total_pages}
              />

              {/* Group Pages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Group Pages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group) => (
                      <div
                        key={group.id}
                        // to={`/${group.notebook_id}/group/${group.id}/${group.pages[0]}`}
                        className="group"
                      >
                        <Card className="hover-scale">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                              <span className="truncate">{group.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {group.pages.length} pages
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {group.description || "No description"}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {group.pages.slice(0, 3).map((pageNum) => (
                                <Badge
                                  key={pageNum}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  Page {pageNum}
                                </Badge>
                              ))}
                              {group.pages.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{group.pages.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <Link
                              to={`/${group.notebook_id}/group/${group.id}/${group.pages[0]}`}
                              className="flex-1"
                            >
                              <Button variant="outline" className="w-full mt-5">
                                Open
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default NotebookDetail;
