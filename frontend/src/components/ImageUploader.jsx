import React, { useRef, useState } from 'react';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { uploadsApi } from '../services/api';

const ImageUploader = ({ value, onChange, label }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('url'); // 'url' or 'upload'

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não permitido. Use JPG, PNG, GIF, WebP ou SVG.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadsApi.uploadImage(file);
      onChange(result.url);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearImage = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`px-2 py-1 text-xs rounded ${mode === 'url' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            URL
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-2 py-1 text-xs rounded ${mode === 'upload' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            Upload
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      ) : (
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Escolher arquivo
              </>
            )}
          </Button>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative bg-slate-100 rounded-xl p-3">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/400x300?text=Erro+ao+carregar';
            }}
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!value && (
        <div className="bg-slate-100 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-sm">Nenhuma imagem</span>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
