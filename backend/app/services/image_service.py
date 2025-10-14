import os
import uuid
from pathlib import Path
from typing import List
from fastapi import UploadFile, HTTPException
from PIL import Image
import aiofiles

class ImageService:
    """Service pour gérer l'upload et le traitement des images"""
    
    def __init__(self):
        self.upload_dir = Path("/app/uploads")
        self.upload_dir.mkdir(exist_ok=True, parents=True)
        self.max_size = 5 * 1024 * 1024  # 5MB
        self.allowed_extensions = {".jpg", ".jpeg", ".png", ".webp"}
        self.thumbnail_size = (400, 400)
    
    async def save_image(self, file: UploadFile) -> str:
        """Sauvegarde une image et crée une miniature"""
        # Vérifier l'extension
        file_ext = Path(file.filename).suffix.lower() if file.filename else ""
        if file_ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Format de fichier non autorisé. Formats acceptés: {', '.join(self.allowed_extensions)}"
            )
        
        # Lire le contenu
        content = await file.read()
        if len(content) > self.max_size:
            raise HTTPException(
                status_code=400,
                detail="Fichier trop volumineux (max 5MB)"
            )
        
        # Générer un nom unique
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = self.upload_dir / unique_filename
        
        # Sauvegarder le fichier
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(content)
        
        # Créer une miniature
        try:
            await self.create_thumbnail(file_path)
        except Exception as e:
            # Si la création de miniature échoue, on supprime le fichier
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"Erreur lors de la création de la miniature: {str(e)}"
            )
        
        return str(unique_filename)
    
    async def create_thumbnail(self, image_path: Path):
        """Crée une miniature d'une image"""
        thumbnail_path = self.upload_dir / f"thumb_{image_path.name}"
        
        with Image.open(image_path) as img:
            # Convertir en RGB si nécessaire (pour PNG avec transparence)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Créer la miniature
            img.thumbnail(self.thumbnail_size)
            img.save(thumbnail_path, optimize=True, quality=85)
    
    async def delete_image(self, filename: str):
        """Supprime une image et sa miniature"""
        file_path = self.upload_dir / filename
        thumbnail_path = self.upload_dir / f"thumb_{filename}"
        
        if file_path.exists():
            file_path.unlink()
        if thumbnail_path.exists():
            thumbnail_path.unlink()
    
    async def save_multiple_images(self, files: List[UploadFile]) -> List[str]:
        """Sauvegarde plusieurs images"""
        if len(files) > 5:
            raise HTTPException(
                status_code=400,
                detail="Maximum 5 images autorisées"
            )
        
        saved_files = []
        try:
            for file in files:
                filename = await self.save_image(file)
                saved_files.append(filename)
            return saved_files
        except Exception as e:
            # Nettoyer en cas d'erreur
            for filename in saved_files:
                await self.delete_image(filename)
            raise e

# Instance globale du service
image_service = ImageService()

