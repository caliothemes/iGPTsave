import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Upload, Copy, Trash2, Check, Image as ImageIcon, Loader2, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

export default function AdminFiles() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of Array.from(selectedFiles)) {
        const result = await base44.integrations.Core.UploadFile({ file });
        if (result.file_url) {
          uploadedFiles.push({
            id: Date.now() + Math.random(),
            name: file.name,
            url: result.file_url,
            type: file.type,
            size: file.size,
            uploadedAt: new Date().toISOString()
          });
        }
      }

      setFiles(prev => [...uploadedFiles, ...prev]);
      toast.success(`${uploadedFiles.length} fichier(s) uploadé(s)`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('URL copiée');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    toast.success('Fichier retiré de la liste');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <AdminLayout currentPage="files">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestion des fichiers</h1>
            <p className="text-white/60">Uploadez et gérez vos images pour les newsletters</p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-12 transition-all",
            dragActive 
              ? "border-violet-500 bg-violet-500/10" 
              : "border-white/20 bg-white/5 hover:border-white/40"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-violet-600/20">
              <Upload className="h-8 w-8 text-violet-400" />
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-medium mb-1">
                Glissez-déposez vos fichiers ici
              </p>
              <p className="text-white/60 text-sm">
                ou cliquez pour parcourir
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Sélectionner des fichiers
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Files Grid */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">
              Fichiers uploadés ({files.length})
            </h2>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden group hover:border-white/30 transition-all"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-video bg-black/20 overflow-hidden">
                    {file.type?.startsWith('image/') ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <ImageIcon className="h-12 w-12 text-white/20" />
                      </div>
                    )}
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => removeFile(file.id)}
                      className="absolute top-2 right-2 p-2 bg-red-600/80 hover:bg-red-600 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* File Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-white text-sm font-medium truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-white/40 text-xs">
                        {formatFileSize(file.size)}
                      </p>
                    </div>

                    {/* URL Input with Copy */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={file.url}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs font-mono truncate"
                        onClick={(e) => e.target.select()}
                      />
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(file.url)}
                        className={cn(
                          "px-3",
                          copiedUrl === file.url 
                            ? "bg-green-600 hover:bg-green-700" 
                            : "bg-violet-600 hover:bg-violet-700"
                        )}
                      >
                        {copiedUrl === file.url ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && !uploading && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">Aucun fichier uploadé</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}