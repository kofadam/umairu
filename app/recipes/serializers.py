from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Recipe, Ingredient, NutritionFacts, Note, Tag


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'amount', 'unit', 'notes', 'order']


class NutritionFactsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionFacts
        fields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'auto_fetched', 'fetched_at']


class NoteSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Note
        fields = ['id', 'content', 'author_name', 'created_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() or obj.author.username if obj.author else 'Unknown'


class RecipeListSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    total_time = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Recipe
        fields = ['id', 'title', 'title_ja', 'description', 'photo_url',
                  'prep_time', 'cook_time', 'total_time', 'servings', 'tags', 'created_at']

    def get_total_time(self, obj):
        if obj.prep_time and obj.cook_time:
            return obj.prep_time + obj.cook_time
        return obj.prep_time or obj.cook_time

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.photo.url) if request else obj.photo.url
        return None


class RecipeDetailSerializer(RecipeListSerializer):
    ingredients = IngredientSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    nutrition = NutritionFactsSerializer(read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.all(), write_only=True, source='tags', required=False
    )

    class Meta(RecipeListSerializer.Meta):
        fields = RecipeListSerializer.Meta.fields + [
            'source_url', 'instructions', 'ingredients', 'notes', 'nutrition', 'tag_ids'
        ]