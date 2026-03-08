from rest_framework import viewsets, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
import requests
from bs4 import BeautifulSoup
import re

from .models import Recipe, Ingredient, NutritionFacts, Note, Tag
from .serializers import (
    RecipeListSerializer, RecipeDetailSerializer,
    NoteSerializer, TagSerializer, NutritionFactsSerializer
)


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class RecipeViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Recipe.objects.prefetch_related('tags', 'ingredients', 'notes')
        q = self.request.query_params.get('q')
        tag = self.request.query_params.get('tag')
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(title_ja__icontains=q) | qs.filter(description__icontains=q)
        if tag:
            qs = qs.filter(tags__name=tag)
        return qs.distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return RecipeListSerializer
        return RecipeDetailSerializer

    def perform_create(self, serializer):
        recipe = serializer.save(created_by=self.request.user)
        # save ingredients if provided
        ingredients_data = self.request.data.get('ingredients', [])
        for i, ing in enumerate(ingredients_data):
            Ingredient.objects.create(recipe=recipe, order=i, **ing)

    def perform_update(self, serializer):
        recipe = serializer.save()
        ingredients_data = self.request.data.get('ingredients')
        if ingredients_data is not None:
            recipe.ingredients.all().delete()
            for i, ing in enumerate(ingredients_data):
                Ingredient.objects.create(recipe=recipe, order=i, **ing)


class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(recipe_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        recipe = get_object_or_404(Recipe, pk=self.kwargs['pk'])
        serializer.save(author=self.request.user, recipe=recipe)


class NutritionView(generics.RetrieveAPIView):
    serializer_class = NutritionFactsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return get_object_or_404(NutritionFacts, recipe_id=self.kwargs['pk'])


# ── Ingredient parser ─────────────────────────────────
def parse_ingredient_line(line):
    line = re.sub(r'\*\*(.+?)\*\*', r'\1', line).strip()
    line = re.sub(r'^[-•]\s*', '', line)
    pattern = r'^([\d./–\-]+(?:\s*[\d./]+)?)\s*([a-zA-Z]+)?\s+(.+)$'
    match = re.match(pattern, line)
    if match:
        amount_str, unit, name = match.groups()
        try:
            amount = float(sum(float(x) for x in re.split(r'[-–]', amount_str)) / max(len(re.split(r'[-–]', amount_str)), 1))
        except:
            amount = None
        return {'amount': amount, 'unit': unit or '', 'name': name.strip(), 'notes': ''}
    return {'amount': None, 'unit': '', 'name': line, 'notes': ''}


# ── Markdown importer ─────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_from_markdown(request):
    md = request.data.get('markdown', '')
    if not md:
        return Response({'error': 'No markdown provided'}, status=400)

    lines = md.split('\n')
    data = {'title': '', 'description': '', 'instructions': '', 'ingredients': [],
            'prep_time': None, 'cook_time': None, 'servings': 4, 'notes': ''}

    section = None
    instruction_lines = []
    note_lines = []
    desc_lines = []

    for line in lines:
        line = line.rstrip()

        # Title
        if line.startswith('# ') and not data['title']:
            data['title'] = line[2:].strip()
            continue

        # Time
        if '⏱' in line or 'Total Time' in line or 'time' in line.lower():
            match = re.search(r'(\d+)', line)
            if match:
                data['cook_time'] = int(match.group(1))
            continue

        # Servings
        if '🍲' in line or 'Yield' in line or 'serving' in line.lower():
            match = re.search(r'(\d+)', line)
            if match:
                data['servings'] = int(match.group(1))
            continue

        # Section headers
        if re.match(r'^## Ingredients', line, re.I):
            section = 'ingredients'
            continue
        if re.match(r'^## Instructions', line, re.I):
            section = 'instructions'
            continue
        if re.match(r'^## Notes', line, re.I):
            section = 'notes'
            continue
        if re.match(r'^## Serving', line, re.I):
            section = 'serving'
            continue
        if re.match(r'^###', line):
            if section == 'instructions':
                instruction_lines.append(f"\n{line[4:].strip()}")
            continue

        # Skip dividers
        if line.startswith('---'):
            continue

        # Content
        if section == 'ingredients':
            if line.startswith('-') or (line and line[0].isdigit()):
                data['ingredients'].append(parse_ingredient_line(line))
        elif section == 'instructions':
            if line.strip():
                instruction_lines.append(line.strip())
        elif section == 'notes':
            if line.strip():
                note_lines.append(line.strip())
        elif section is None and line.strip() and not line.startswith('#'):
            desc_lines.append(line.strip())

    data['description'] = ' '.join(desc_lines)
    data['instructions'] = '\n'.join(instruction_lines)
    data['notes_text'] = '\n'.join(note_lines)

    return Response(data)


# ── URL importer ──────────────────────────────────────
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_from_url(request):
    url = request.data.get('url', '')
    if not url:
        return Response({'error': 'No URL provided'}, status=400)

    try:
        headers = {'User-Agent': 'Mozilla/5.0'}
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        data = {
            'title': '',
            'description': '',
            'instructions': '',
            'ingredients': [],
            'source_url': url,
        }

        # Try JSON-LD schema first (most recipe sites use it)
        import json
        for script in soup.find_all('script', type='application/ld+json'):
            try:
                ld = json.loads(script.string)
                if isinstance(ld, list):
                    ld = next((x for x in ld if x.get('@type') == 'Recipe'), {})
                if ld.get('@type') == 'Recipe':
                    data['title'] = ld.get('name', '')
                    data['description'] = ld.get('description', '')
                    data['ingredients'] = [
                        parse_ingredient_line(i) for i in ld.get('recipeIngredient', [])
                    ]
                    instructions = ld.get('recipeInstructions', [])
                    if isinstance(instructions, list):
                        data['instructions'] = '\n'.join(
                            i.get('text', i) if isinstance(i, dict) else i
                            for i in instructions
                        )
                    elif isinstance(instructions, str):
                        data['instructions'] = instructions
                    break
            except:
                continue

        # Fallback to meta tags
        if not data['title']:
            tag = soup.find('meta', property='og:title') or soup.find('title')
            data['title'] = tag.get('content', tag.text) if tag else ''
        if not data['description']:
            tag = soup.find('meta', property='og:description')
            data['description'] = tag.get('content', '') if tag else ''

        return Response(data)

    except Exception as e:
        return Response({'error': str(e)}, status=400)