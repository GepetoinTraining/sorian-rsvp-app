'use client';

import { useState, useRef } from 'react';
import { FileButton, Button, Group, Text, Image, Stack, Loader, ActionIcon } from '@mantine/core';
import { IconUpload, IconX } from '@tabler/icons-react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Upload Imagem" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const resetRef = useRef<() => void>(null);

  // FIX: Accept 'File | null' to match Mantine's FileButton signature
  const handleUpload = async (file: File | null) => {
    // Guard clause for null (no file selected)
    if (!file) return;

    setUploading(true);
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      const newBlob = await response.json();
      onChange(newBlob.url);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Erro ao fazer upload da imagem.");
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    resetRef.current?.();
  };

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>{label}</Text>
      
      {value ? (
        <div style={{ position: 'relative', width: 'fit-content' }}>
           <Image 
              src={value} 
              radius="md" 
              h={150} 
              w="auto" 
              fit="cover" 
              alt="Preview" 
            />
           <ActionIcon 
              color="red" 
              variant="filled" 
              size="sm" 
              style={{ position: 'absolute', top: 5, right: 5 }}
              onClick={clearImage}
            >
              <IconX size={12} />
           </ActionIcon>
        </div>
      ) : (
        <Group>
          <FileButton 
            resetRef={resetRef} 
            onChange={handleUpload} 
            accept="image/png,image/jpeg,image/webp"
          >
            {(props) => (
              <Button 
                {...props} 
                disabled={uploading} 
                variant="default" 
                leftSection={uploading ? <Loader size={16} /> : <IconUpload size={16} />}
              >
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </Button>
            )}
          </FileButton>
          <Text size="sm" c="dimmed" fs="italic">
            Recomendado: .jpg ou .png
          </Text>
        </Group>
      )}
    </Stack>
  );
}