import { Link } from 'react-router-dom'
import { Search, ChefHat, Heart, Users, Sparkles, ArrowRight, TrendingUp, Clock, Star } from 'lucide-react'

export default function Home(){
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-warm-cream via-white to-secondary-50 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container relative py-20 sm:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-slideUp">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-primary/20 shadow-soft">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-semibold text-gray-700">Votre communauté culinaire</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-tight">
                Partagez vos
                <span className="block text-gradient-primary mt-2">
                  Recettes Préférées
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                Découvrez, créez et partagez des recettes authentiques avec une communauté de passionnés. 
                De l'entrée au dessert, trouvez l'inspiration pour vos prochains plats.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/recipes" className="btn btn-primary text-lg px-8 py-3 shadow-warm">
                  <Search className="w-5 h-5" />
                  Découvrir les recettes
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/register" className="btn btn-secondary text-lg px-8 py-3">
                  <ChefHat className="w-5 h-5" />
                  Commencer gratuitement
                </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">1,000+</p>
                    <p className="text-sm text-gray-600">Membres actifs</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-secondary-dark" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">5,000+</p>
                    <p className="text-sm text-gray-600">Recettes partagées</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Image Grid */}
            <div className="relative hidden lg:block animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4 pt-8">
                  <div className="card-hover overflow-hidden aspect-[3/4]">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=600&fit=crop" 
                      alt="Salade fraîche" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="card-warm p-6">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">Tendance</span>
                    </div>
                    <p className="text-sm text-gray-600">Plus de 2,000 recettes consultées cette semaine</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="card-warm p-6">
                    <div className="flex items-center gap-2 text-secondary-dark mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold">Rapide</span>
                    </div>
                    <p className="text-sm text-gray-600">Des recettes en 30 minutes ou moins</p>
                  </div>
                  <div className="card-hover overflow-hidden aspect-[3/4]">
                    <img 
                      src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=600&fit=crop" 
                      alt="Pancakes" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 glass p-4 rounded-2xl shadow-xl animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-xl flex items-center justify-center shadow-warm">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">4.9/5</p>
                    <p className="text-xs text-gray-600">Note moyenne</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16 animate-slideUp">
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Pourquoi choisir <span className="text-gradient-primary">Recette</span> ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une expérience culinaire moderne, pensée pour les passionnés de cuisine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ChefHat,
                title: 'Création Simple',
                description: 'Créez et partagez vos recettes en quelques clics avec notre éditeur intuitif',
                color: 'primary',
              },
              {
                icon: Heart,
                title: 'Communauté Active',
                description: 'Interagissez avec d\'autres passionnés, aimez et commentez les recettes',
                color: 'secondary',
              },
              {
                icon: Search,
                title: 'Recherche Avancée',
                description: 'Trouvez la recette parfaite grâce à nos filtres intelligents',
                color: 'primary',
              },
            ].map((feature, index) => (
              <div 
                key={feature.title} 
                className="card-hover text-center group animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-${feature.color} to-${feature.color}-light rounded-2xl flex items-center justify-center shadow-warm group-hover:shadow-warm-lg transition-all duration-300 group-hover:scale-110`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="container relative text-center">
          <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6 animate-slideUp">
            Prêt à commencer votre aventure culinaire ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Rejoignez notre communauté et partagez vos meilleures recettes dès aujourd'hui
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3 border-2 border-white">
              <UserPlus className="w-5 h-5" />
              Créer un compte gratuit
            </Link>
            <Link to="/recipes" className="btn bg-transparent text-white border-2 border-white hover:bg-white/10 text-lg px-8 py-3">
              <BookOpen className="w-5 h-5" />
              Explorer les recettes
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

import { UserPlus, BookOpen } from 'lucide-react'
