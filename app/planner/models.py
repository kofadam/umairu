from django.db import models
from django.contrib.auth.models import User
from recipes.models import Recipe


class MealPlan(models.Model):
    date = models.DateField()
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='meal_plans')
    planned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notes = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} — {self.recipe.title}"

    class Meta:
        ordering = ['date']
        unique_together = ['date', 'recipe']