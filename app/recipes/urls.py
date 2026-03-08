from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'recipes', views.RecipeViewSet, basename='recipe')
router.register(r'tags', views.TagViewSet, basename='tag')

urlpatterns = [
    path('recipes/import-url/', views.import_from_url, name='import-url'),
    path('recipes/import-md/', views.import_from_markdown, name='import-md'),
    path('recipes/<int:pk>/notes/', views.NoteListCreateView.as_view(), name='recipe-notes'),
    path('recipes/<int:pk>/nutrition/', views.NutritionView.as_view(), name='recipe-nutrition'),
    path('', include(router.urls)),
]