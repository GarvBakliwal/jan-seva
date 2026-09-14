'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, FolderOpen, ShieldCheck, Trash2, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
    onFileSelect?: (file: File | null) => void;
    maxSizeBytes?: number;
}

export default function PhotoUploadSection({
    onFileSelect,
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
}: PhotoUploadProps): React.JSX.Element {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [imagePreviewError, setImagePreviewError] = useState<boolean>(false);

    // Clean up Object URL on unmount or file change to prevent memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Client-side image compressor (optional helper)
    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const img = new window.Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(compressedFile);
                        } else {
                            resolve(file);
                        }
                    },
                    'image/jpeg',
                    0.85 // 85% JPEG Quality
                );
            };

            img.onerror = () => resolve(file);
            img.src = objectUrl;
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setErrorMessage('');
        setImagePreviewError(false);

        // 1. File Type Validation
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setErrorMessage('Invalid file format. Please upload JPG, JPEG, or PNG.');
            return;
        }

        // 2. File Size Validation
        if (file.size > maxSizeBytes) {
            setErrorMessage(`File exceeds max size limit of ${maxSizeBytes / (1024 * 1024)} MB.`);
            return;
        }

        // 3. Compress & Generate Preview
        const compressed = await compressImage(file);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        const newPreviewUrl = URL.createObjectURL(compressed);
        setSelectedFile(compressed);
        setPreviewUrl(newPreviewUrl);
        onFileSelect?.(compressed);
    };

    const handleRemovePhoto = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl(null);
        setErrorMessage('');
        setImagePreviewError(false);
        onFileSelect?.(null);

        // Reset native input values so user can re-upload the same file if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs space-y-3">
            {/* Header Badge */}
            <div className="flex items-center justify-between gap-2">
                <label className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <span>2. Upload a Photo</span>
                    <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                    <Camera size={11} /> Geotagged
                </span>
            </div>

            <p className="text-xs text-gray-500">
                A clear photo helps municipal engineers inspect and verify the issue promptly.
            </p>

            {/* Error Message */}
            {errorMessage && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Hidden File Inputs */}
            {/* 1. Camera Input (Mobile capture environment) */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/png"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />
            {/* 2. Generic File System Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="py-2.5 px-3 bg-[var(--gov-navy)] hover:bg-[#091728] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-[0.99]"
                >
                    <Camera size={15} />
                    <span>Take Photo</span>
                </button>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100/80 text-[var(--gov-blue)] border border-blue-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.99]"
                >
                    <FolderOpen size={15} />
                    <span>Upload File</span>
                </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center">
                Max size: 5 MB · Accepted formats: JPG, JPEG, PNG
            </p>

            {/* Photo Uploaded Preview Card */}
            {selectedFile && previewUrl && (
                <div className="p-2.5 rounded-xl border border-gray-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-gray-300 bg-slate-100 flex items-center justify-center">
                            {imagePreviewError ? (
                                <div className="px-1 text-center text-[9px] font-semibold text-gray-500">
                                    Preview unavailable
                                </div>
                            ) : (
                                <Image
                                    src={previewUrl}
                                    alt="Uploaded issue evidence"
                                    fill
                                    sizes="64px"
                                    unoptimized
                                    className="object-cover"
                                    onError={() => setImagePreviewError(true)}
                                />
                            )}
                        </div>
                        <div className="min-w-0 space-y-0.5">
                            <p className="text-xs font-bold text-gray-900 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-[10px] text-gray-500">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                <ShieldCheck size={11} /> Ready to submit
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                        title="Remove photo"
                        aria-label="Remove photo"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}
        </div>
    );
}