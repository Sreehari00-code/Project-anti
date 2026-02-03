import { useState, useRef } from 'react';

interface ImageUploadProps {
    onUpload: (url: string) => void;
    currentImage?: string;
    label?: string;
}

export default function ImageUpload({ onUpload, currentImage, label = "Upload Image" }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentImage || '');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok) {
                onUpload(data.url);
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>
                {label}
            </label>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                ref={fileInputRef}
            />

            <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                    border: '2px dashed rgba(255, 255, 255, 0.2)',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.05)',
                    transition: 'all 0.3s',
                    position: 'relative',
                    minHeight: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '200px',
                            objectFit: 'contain',
                            borderRadius: '0.5rem'
                        }}
                    />
                ) : (
                    <div style={{ color: '#94a3b8' }}>
                        <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>☁️</span>
                        <span>Click to Select Image</span>
                    </div>
                )}

                {uploading && (
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                    }}>
                        Uploading...
                    </div>
                )}
            </div>
            {preview && !uploading && (
                <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreview('');
                            onUpload('');
                            if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#fca5a5',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                        }}
                    >
                        Remove Image
                    </button>
                </div>
            )}
        </div>
    );
}
