from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MealPlan
from .serializers import MealPlanSerializer


class MealPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MealPlanSerializer

    def get_queryset(self):
        qs = MealPlan.objects.select_related('recipe').all()
        month = self.request.query_params.get('month')  # format: 2026-03
        if month:
            year, m = month.split('-')
            qs = qs.filter(date__year=year, date__month=m)
        return qs

    def perform_create(self, serializer):
        serializer.save(planned_by=self.request.user)