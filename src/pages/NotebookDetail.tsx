import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotebooks } from "@/hooks/useNotebooks";
import { ArrowLeft, Settings, Trash2, FileText, Users, Search } from "lucide-react";
import Layout from "@/components/Layout";
import PageGroupManager from "@/components/PageGroupManager";
import { useToast } from "@/hooks/use-toast";

const NotebookDetail = () => {
  const { notebookId } = useParams<{ notebookId: string }>();
  const { getNotebook, categories, deleteNotebook, getNotebookGroups } = useNotebooks();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");
  const [pageSearch, setPageSearch] = useState("");

  const notebook = notebookId ? getNotebook(notebookId) : undefined;
  const groups = notebookId ? getNotebookGroups(notebookId) : [];

  if (!notebook) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Notebook Not Found</h1>
          <p className="text-muted-foreground mb-6">The requested notebook could not be found.</p>
          <Link to="/dashboard">
            <Button className="gradient-bg text-primary-foreground rounded-xl">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

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
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this notebook? All notes will be lost.")) {
      deleteNotebook(notebook.id);
      toast({ title: "Notebook Deleted" });
      navigate("/dashboard");
    }
  };

  const pageGrid = Array.from({ length: notebook.total_pages }, (_, i) => i + 1);
  const filteredPages = pageSearch 
    ? pageGrid.filter(p => p.toString().includes(pageSearch))
    : pageGrid;

  const getPageGroups = (pageNumber: number) => {
    return groups.filter((group) => group.pages.includes(pageNumber));
  };

  return (
    <Layout title={notebook.nickname}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{notebook.nickname}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {getCategoryName(notebook.category_id)}
                </Badge>
                <span className="text-muted-foreground">{notebook.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="rounded-xl border-border/50">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleDelete}
              className="rounded-xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <Card className="mb-8 bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  min="1"
                  max={notebook.total_pages}
                  placeholder="Go to page..."
                  className="pl-10 pr-4 py-2 bg-secondary/50 border border-border/50 rounded-xl w-40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      const pageNum = parseInt((e.target as HTMLInputElement).value);
                      if (pageNum >= 1 && pageNum <= notebook.total_pages) {
                        navigate(`/page/${notebook.id}/${pageNum}`);
                      }
                    }
                  }}
                  onChange={(e) => setPageSearch(e.target.value)}
                />
              </div>
              <span className="text-muted-foreground">of {notebook.total_pages} pages</span>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Pages and Groups */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/50 border border-border/30 rounded-xl p-1 mb-6">
            <TabsTrigger 
              value="pages" 
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="w-4 h-4 mr-2" />
              All Pages
            </TabsTrigger>
            <TabsTrigger 
              value="groups"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Page Groups
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">All Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-12 gap-3">
                  {filteredPages.map((pageNumber) => {
                    const pageGroups = getPageGroups(pageNumber);
                    return (
                      <Link
                        key={pageNumber}
                        to={`/page/${notebook.id}/${pageNumber}`}
                        className="group relative"
                      >
                        <div className="aspect-square bg-secondary/50 border border-border/30 rounded-xl hover:border-primary hover:bg-primary/10 transition-all flex flex-col items-center justify-center p-2 group">
                          <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary mb-1 transition-colors" />
                          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            {pageNumber}
                          </span>
                          {pageGroups.length > 0 && (
                            <div className="absolute -top-1 -right-1 gradient-bg text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-glow-sm">
                              {pageGroups.length}
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups">
            <div className="space-y-6">
              <PageGroupManager
                notebookId={notebook.id}
                totalPages={notebook.total_pages}
              />

              {/* Group Cards */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Your Groups</CardTitle>
                </CardHeader>
                <CardContent>
                  {groups.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No page groups created yet. Create one above!
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groups.map((group) => (
                        <Card key={group.id} className="bg-secondary/30 border-border/30 rounded-xl hover-scale">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center justify-between text-foreground">
                              <span className="truncate">{group.name}</span>
                              <Badge variant="outline" className="ml-2 border-primary/30 text-primary">
                                {group.pages.length} pages
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {group.description || "No description"}
                            </p>
                            <div className="flex flex-wrap gap-1 mb-4">
                              {group.pages.slice(0, 3).map((pageNum) => (
                                <Badge key={pageNum} className="bg-secondary text-secondary-foreground text-xs">
                                  Page {pageNum}
                                </Badge>
                              ))}
                              {group.pages.length > 3 && (
                                <Badge className="bg-secondary text-secondary-foreground text-xs">
                                  +{group.pages.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <Link to={`/${group.notebook_id}/group/${group.id}/${group.pages[0]}`}>
                              <Button variant="outline" className="w-full rounded-xl border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30">
                                Open Group
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
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
