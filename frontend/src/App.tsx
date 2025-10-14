import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { ChefHat, Home as HomeIcon, BookOpen, PlusCircle, User, LogOut, LogIn, UserPlus, Settings } from 'lucide-react'
import Home from './pages/Home'
import Recipes from './pages/Recipes'
import Login from './pages/Login'
import Register from './pages/Register'
import RecipeForm from './pages/RecipeForm'
import RecipeDetail from './pages/RecipeDetail'
import MyRecipes from './pages/MyRecipes'
import { useAuth } from './hooks/useAuth'

function Navbar(){
  const { user, logout } = useAuth()
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-soft">
      <div className="container">
        <div className="flex items-center justify-between py-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-warm group-hover:shadow-warm-lg transition-all duration-300 group-hover:scale-105">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                Recette
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                to="/" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-primary-50 transition-all duration-200"
              >
                <HomeIcon className="w-4 h-4" />
                <span className="font-medium">Accueil</span>
              </Link>
              <Link 
                to="/recipes" 
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-primary-50 transition-all duration-200"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium">Recettes</span>
              </Link>
              {user && (
                <Link 
                  to="/my-recipes" 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:text-primary hover:bg-primary-50 transition-all duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span className="font-medium">Mes recettes</span>
                </Link>
              )}
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link 
                  to="/recipes/new" 
                  className="btn btn-primary hidden sm:flex"
                >
                  <PlusCircle className="w-4 h-4" />
                  Nouvelle recette
                </Link>
                
                <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-br from-secondary to-secondary-dark rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold text-gray-900">{user.username || 'Utilisateur'}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={logout}
                    className="btn-icon text-gray-600 hover:text-primary"
                    title="Déconnexion"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost" to="/login">
                  <LogIn className="w-4 h-4" />
                  Connexion
                </Link>
                <Link className="btn btn-primary" to="/register">
                  <UserPlus className="w-4 h-4" />
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function PrivateRoute({ children }: { children: JSX.Element }){
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App(){
  return (
    <div>
      <Navbar />
      <main className="container py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/recipes/new" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/edit" element={<PrivateRoute><RecipeForm /></PrivateRoute>} />
          <Route path="/my-recipes" element={<PrivateRoute><MyRecipes /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
