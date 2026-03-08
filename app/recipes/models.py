from django.db import models
from django.contrib.auth.models import User


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Recipe(models.Model):
    title = models.CharField(max_length=255)
    title_ja = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    source_url = models.URLField(blank=True)
    instructions = models.TextField(blank=True)
    prep_time = models.PositiveIntegerField(null=True, blank=True, help_text="minutes")
    cook_time = models.PositiveIntegerField(null=True, blank=True, help_text="minutes")
    servings = models.PositiveIntegerField(default=4)
    photo = models.ImageField(upload_to='recipes/', blank=True, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Ingredient(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    name = models.CharField(max_length=255)
    amount = models.FloatField(null=True, blank=True)
    unit = models.CharField(max_length=50, blank=True)
    notes = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.amount} {self.unit} {self.name}".strip()

    class Meta:
        ordering = ['order']


class NutritionFacts(models.Model):
    recipe = models.OneToOneField(Recipe, on_delete=models.CASCADE, related_name='nutrition')
    calories = models.FloatField(null=True, blank=True)
    protein = models.FloatField(null=True, blank=True)
    carbs = models.FloatField(null=True, blank=True)
    fat = models.FloatField(null=True, blank=True)
    fiber = models.FloatField(null=True, blank=True)
    auto_fetched = models.BooleanField(default=False)
    fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Nutrition for {self.recipe.title}"


class Note(models.Model):
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note by {self.author} on {self.recipe.title}"

    class Meta:
        ordering = ['-created_at']