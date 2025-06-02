import { useState, useRef, useCallback, useEffect, RefObject } from "react";

interface UseCameraReturn {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  isActive: boolean;
  error: string;
  devices: MediaDeviceInfo[];
  currentDeviceId: string;
  zoom: number;
  rotation: number;
  flipHorizontal: boolean;
  startCamera: (deviceId?: string) => Promise<void>;
  stopCamera: () => void;
  capturePhoto: () => Promise<File | null>;
  switchCamera: () => void;
  setZoom: (value: number) => void;
  setRotation: (value: number) => void;
  setFlipHorizontal: (value: boolean) => void;
  getDevices: () => Promise<void>;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>("");
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipHorizontal, setFlipHorizontal] = useState(false);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0 && !currentDeviceId) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
    } catch {
      setError("Failed to get camera devices");
    }
  }, [currentDeviceId]);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      try {
        setError("");

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: {
            deviceId: deviceId ? { exact: deviceId } : undefined,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: deviceId ? undefined : "user",
          },
        };

        const newStream = await navigator.mediaDevices.getUserMedia(
          constraints
        );
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          await videoRef.current.play();
          setIsActive(true);
        }
      } catch (err) {
        setError("Failed to access camera. Please check permissions.");
        console.error("Camera error:", err);
      }
    },
    [stream]
  );

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setZoom(1);
    setRotation(0);
    setFlipHorizontal(false);
  }, [stream]);

  const capturePhoto = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      if (flipHorizontal) ctx.scale(-1, 1);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(video, -canvas.width / 2, -canvas.height / 2);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(file);
          } else {
            resolve(null);
          }
        },
        "image/jpeg",
        0.9
      );
    });
  }, [zoom, rotation, flipHorizontal]);

  const switchCamera = useCallback(() => {
    if (devices.length > 1) {
      const currentIndex = devices.findIndex(
        (d) => d.deviceId === currentDeviceId
      );
      const nextIndex = (currentIndex + 1) % devices.length;
      const nextDeviceId = devices[nextIndex].deviceId;
      setCurrentDeviceId(nextDeviceId);
      startCamera(nextDeviceId);
    }
  }, [devices, currentDeviceId, startCamera]);

  useEffect(() => {
    getDevices();
  }, [getDevices]);

  return {
    videoRef,
    canvasRef,
    isActive,
    error,
    devices,
    currentDeviceId,
    zoom,
    rotation,
    flipHorizontal,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    setZoom,
    setRotation,
    setFlipHorizontal,
    getDevices,
  };
}
