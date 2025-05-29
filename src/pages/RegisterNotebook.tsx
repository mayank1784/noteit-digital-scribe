import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useNotebooks } from "@/hooks/useNotebooks";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Camera, QrCode, Keyboard } from "lucide-react";
import Layout from "@/components/Layout";
import { Html5Qrcode } from "html5-qrcode";

const RegisterNotebook = () => {
  const [searchParams] = useSearchParams();
  const initialNotebookId = searchParams.get("notebookId") || "";
  const initialNickname = searchParams.get("nickname") || "";

  const [notebookId, setNotebookId] = useState(initialNotebookId.toUpperCase());
  const [nickname, setNickname] = useState(
    initialNickname.length > 0
      ? initialNickname
      : initialNotebookId.toUpperCase()
  );
  const [isScanning, setIsScanning] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(!initialNotebookId);
  const { registerNotebook, templates, notebooks, userPlan } = useNotebooks();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cleanup scanner when component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleScan = async () => {
    setIsScanning(true);
    // Wait for the next render cycle to ensure the element exists
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // Initialize scanner
      scannerRef.current = new Html5Qrcode("qr-reader");

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length) {
        // Use the back camera if available, otherwise use the first camera
        const cameraId =
          devices.find((device) => device.label.toLowerCase().includes("back"))
            ?.id || devices[0].id;

        // Start scanning
        await scannerRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          onScanSuccess,
          onScanFailure
        );
      } else {
        throw new Error("No cameras found");
      }
    } catch (error) {
      console.error("Error starting scanner:", error);
      toast({
        title: "Camera Error",
        description:
          "Could not access camera. Please ensure camera permissions are granted.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const onScanSuccess = (decodedText: string) => {
    try {
      // Parse the URL format: <domain>/register-notebook/<notebookid>
      const url = new URL(decodedText);
      const pathParts = url.pathname.split("/");
      const scannedNotebookId = pathParts[pathParts.length - 1];

      if (scannedNotebookId) {
        setNotebookId(scannedNotebookId.toUpperCase());
        setNickname(scannedNotebookId);
        setIsScanning(false);

        // Stop scanner
        if (scannerRef.current) {
          scannerRef.current.stop().catch(console.error);
        }

        toast({
          title: "QR Code Detected!",
          description: "Notebook ID has been filled automatically",
        });
      } else {
        throw new Error("Invalid QR code format");
      }
    } catch (error) {
      toast({
        title: "Invalid QR Code",
        description: "Please scan a valid Noteit notebook QR code",
        variant: "destructive",
      });
    }
  };

  const onScanFailure = (error: string) => {
    // Handle scan failure silently
    console.warn(`QR Code scan failed: ${error}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notebookId || !nickname) {
      toast({
        title: "Missing Information",
        description: "Please provide both notebook ID and nickname",
        variant: "destructive",
      });
      return;
    }

    // Validate notebook ID format
    if (!/^[A-Z0-9-]+$/.test(notebookId)) {
      toast({
        title: "Invalid Notebook ID",
        description:
          "Notebook ID should only contain uppercase letters, numbers, and hyphens",
        variant: "destructive",
      });
      return;
    }

    // Check if user has reached limit
    if (user && userPlan && notebooks.length >= userPlan.max_notebooks) {
      toast({
        title: "Limit Reached",
        description: `${userPlan.display_name} allows up to ${userPlan.max_notebooks} notebooks. Upgrade to Pro for unlimited notebooks.`,
        variant: "destructive",
      });
      return;
    }

    const success = await registerNotebook(notebookId, nickname);

    if (success) {
      toast({
        title: "Notebook Registered!",
        description: `${nickname} has been added to your account`,
      });
      navigate("/dashboard");
    } else {
      console.log("registartf failed");
      toast({
        title: "Registration Failed",
        description: "This notebook is already registered or invalid",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout title="Register Notebook">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Register Your Notebook
            </CardTitle>
            <CardDescription>
              Scan the QR code on your notebook cover or enter the ID manually
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scanning Method Toggle */}
            <div className="flex space-x-4">
              <Button
                variant={!useManualEntry ? "default" : "outline"}
                onClick={() => setUseManualEntry(false)}
                className="flex-1"
              >
                <Camera className="w-4 h-4 mr-2" />
                QR Scanner
              </Button>
              <Button
                variant={useManualEntry ? "default" : "outline"}
                onClick={() => setUseManualEntry(true)}
                className="flex-1"
              >
                <Keyboard className="w-4 h-4 mr-2" />
                Manual Entry
              </Button>
            </div>

            {/* QR Scanner */}
            {!useManualEntry && (
              <Card>
                <CardContent className="p-8 text-center">
                  {isScanning ? (
                    <div className="space-y-4">
                      <div
                        id="qr-reader"
                        className="w-full max-w-sm mx-auto"
                        ref={qrReaderRef}
                      ></div>
                      <Button
                        variant="outline"
                        onClick={async () => {
                          setIsScanning(false);
                          if (scannerRef.current) {
                            await scannerRef.current
                              .stop()
                              .catch(console.error);
                          }
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-32 h-32 mx-auto border-2 border-gray-300 border-dashed rounded-lg flex items-center justify-center">
                        <Camera className="w-16 h-16 text-gray-400" />
                      </div>
                      <p className="text-gray-600">
                        Position your camera over the QR code on your notebook
                        cover
                      </p>
                      <Button onClick={handleScan} className="gradient-bg">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Scanning
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Manual Entry Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notebookId">Notebook ID</Label>
                <Input
                  id="notebookId"
                  placeholder="Enter notebook ID (e.g., NB001-ABC123)"
                  value={notebookId}
                  onChange={(e) => setNotebookId(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Find this on the inside cover of your Noteit notebook
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Notebook Nickname</Label>
                <Input
                  id="nickname"
                  placeholder="Give your notebook a name (e.g., Study Notes)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">
                  Choose a memorable name to identify this notebook
                </p>
              </div>

              <Button type="submit" className="w-full gradient-bg">
                Register Notebook
              </Button>
            </form>

            {/* Templates Preview */}
            <div className="pt-6 border-t">
              <h3 className="font-semibold text-lg mb-4">
                Available Notebook Types
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.slice(0, 4).map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg text-center"
                  >
                    <p className="font-medium text-sm">{template.title}</p>
                    <p className="text-xs text-gray-500">
                      {template.pages} pages
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RegisterNotebook;
