# Documentation API

API REST pour l'application Recipe App.

**Base URL**: `http://recipe.local/api/v1`  
**Authentication**: Bearer Token (JWT)

## Table des Matières

1. [Authentification](#authentification)
2. [Recettes](#recettes)
3. [Likes](#likes)
4. [Commentaires](#commentaires)
5. [Utilisateurs](#utilisateurs)
6. [Codes d'Erreur](#codes-derreur)

## Authentification

### Inscription

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "bio": null,
  "profile_picture": null,
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Validation**:
- `username`: 3-50 caractères
- `email`: Format email valide
- `password`: Min 8 caractères, 1 majuscule, 1 chiffre

### Connexion

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Profil Actuel

**Endpoint**: `GET /auth/me`

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "bio": "Passionné de cuisine",
  "profile_picture": "/uploads/profile_123.jpg",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Modifier Profil

**Endpoint**: `PUT /auth/me`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "username": "john_chef",
  "bio": "Chef cuisinier amateur",
  "profile_picture": "/uploads/new_profile.jpg"
}
```

## Recettes

### Liste des Recettes

**Endpoint**: `GET /recipes`

**Query Parameters**:
- `skip` (int, default=0): Pagination offset
- `limit` (int, default=20, max=100): Nombre de résultats
- `category` (string): Filtrer par catégorie
- `difficulty` (string): Filtrer par difficulté (facile|moyen|difficile)
- `search` (string): Recherche dans titre et description

**Example**: `GET /recipes?category=dessert&difficulty=facile&limit=10`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "title": "Tarte aux Pommes",
    "description": "Une délicieuse tarte...",
    "prep_time": 30,
    "cook_time": 45,
    "servings": 8,
    "difficulty": "moyen",
    "category": "dessert",
    "ingredients": [
      {
        "name": "Pommes",
        "quantity": "6",
        "unit": "pièces"
      }
    ],
    "steps": [
      "Préchauffer le four à 180°C",
      "Éplucher les pommes..."
    ],
    "images": [
      "/uploads/tarte_123.jpg"
    ],
    "tags": ["français", "automne"],
    "owner_id": 1,
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "likes_count": 15,
    "comments_count": 3
  }
]
```

### Créer une Recette

**Endpoint**: `POST /recipes`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "title": "Ma Nouvelle Recette",
  "description": "Description détaillée d'au moins 20 caractères",
  "prep_time": 20,
  "cook_time": 30,
  "servings": 4,
  "difficulty": "facile",
  "category": "plat",
  "ingredients": [
    {
      "name": "Poulet",
      "quantity": "500",
      "unit": "g"
    }
  ],
  "steps": [
    "Étape 1",
    "Étape 2"
  ],
  "tags": ["rapide", "santé"]
}
```

**Response** (201 Created): Même structure que GET

### Détail d'une Recette

**Endpoint**: `GET /recipes/{id}`

**Response** (200 OK): Même structure que la liste

### Modifier une Recette

**Endpoint**: `PUT /recipes/{id}`

**Headers**: `Authorization: Bearer {token}`

**Note**: Seul le propriétaire peut modifier

**Request Body**: Champs partiels acceptés
```json
{
  "title": "Nouveau Titre",
  "difficulty": "difficile"
}
```

### Supprimer une Recette

**Endpoint**: `DELETE /recipes/{id}`

**Headers**: `Authorization: Bearer {token}`

**Note**: Seul le propriétaire peut supprimer

**Response** (204 No Content)

### Upload d'Images

**Endpoint**: `POST /recipes/{id}/images`

**Headers**: 
- `Authorization: Bearer {token}`
- `Content-Type: multipart/form-data`

**Form Data**:
- `images`: Fichiers (max 5, 5MB chacun)

**Response** (200 OK):
```json
{
  "message": "Images uploaded successfully",
  "images": [
    "/uploads/image1.jpg",
    "/uploads/image2.jpg"
  ]
}
```

## Likes

### Liker/Unliker une Recette

**Endpoint**: `POST /recipes/{id}/like`

**Headers**: `Authorization: Bearer {token}`

**Response** (201 Created) - Like ajouté:
```json
{
  "id": 1,
  "user_id": 1,
  "recipe_id": 5,
  "created_at": "2024-01-15T10:00:00Z"
}
```

**Response** (204 No Content) - Like retiré

### Liste des Likes

**Endpoint**: `GET /recipes/{id}/likes`

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "recipe_id": 5,
    "created_at": "2024-01-15T10:00:00Z",
    "user": {
      "id": 1,
      "username": "john_doe",
      "profile_picture": "/uploads/profile.jpg"
    }
  }
]
```

### Nombre de Likes

**Endpoint**: `GET /recipes/{id}/likes/count`

**Response** (200 OK):
```json
{
  "recipe_id": 5,
  "likes_count": 42
}
```

### Vérifier si Liké

**Endpoint**: `GET /recipes/{id}/likes/me`

**Headers**: `Authorization: Bearer {token}`

**Response** (200 OK):
```json
{
  "liked": true
}
```

## Commentaires

### Liste des Commentaires

**Endpoint**: `GET /recipes/{id}/comments`

**Query Parameters**:
- `skip` (int, default=0)
- `limit` (int, default=50)

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "user_id": 2,
    "recipe_id": 5,
    "content": "Excellente recette!",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z",
    "user": {
      "id": 2,
      "username": "marie_chef",
      "profile_picture": "/uploads/marie.jpg"
    }
  }
]
```

### Ajouter un Commentaire

**Endpoint**: `POST /recipes/{id}/comments`

**Headers**: `Authorization: Bearer {token}`

**Request Body**:
```json
{
  "content": "Super recette, merci!",
  "recipe_id": 5
}
```

**Response** (201 Created): Même structure que GET

### Modifier un Commentaire

**Endpoint**: `PUT /comments/{id}`

**Headers**: `Authorization: Bearer {token}`

**Note**: Seul l'auteur peut modifier

**Request Body**:
```json
{
  "content": "Commentaire mis à jour"
}
```

### Supprimer un Commentaire

**Endpoint**: `DELETE /comments/{id}`

**Headers**: `Authorization: Bearer {token}`

**Note**: L'auteur du commentaire OU l'auteur de la recette peut supprimer

**Response** (204 No Content)

## Utilisateurs

### Profil Public

**Endpoint**: `GET /auth/users/{id}`

**Response** (200 OK):
```json
{
  "id": 1,
  "username": "john_doe",
  "bio": "Chef amateur",
  "profile_picture": "/uploads/john.jpg",
  "created_at": "2024-01-15T10:00:00Z"
}
```

## Codes d'Erreur

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "detail": "Not your recipe"
}
```

### 404 Not Found
```json
{
  "detail": "Recipe not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

- **Authentification**: 5 requêtes/minute
- **API Générale**: 100 requêtes/minute par utilisateur

## Pagination

Toutes les listes supportent la pagination :
- `skip`: Nombre d'éléments à sauter
- `limit`: Nombre d'éléments à retourner (max 100)

## Swagger UI

Documentation interactive disponible à :
- **Swagger UI**: http://recipe.local/api/docs
- **ReDoc**: http://recipe.local/api/redoc
- **OpenAPI JSON**: http://recipe.local/api/openapi.json

