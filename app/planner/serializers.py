from rest_framework import serializers
from .models import MealPlan
from recipes.serializers import RecipeListSerializer


class MealPlanSerializer(serializers.ModelSerializer):
    recipe_detail = RecipeListSerializer(source='recipe', read_only=True)

    class Meta:
        model = MealPlan
        fields = ['id', 'date', 'recipe', 'recipe_detail', 'notes', 'planned_by']
        read_only_fields = ['planned_by']