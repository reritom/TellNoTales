from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse

# Create your views here.

def start(request):
    return render(request, 'deadman/home.html')
