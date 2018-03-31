from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse

def contact(request, contact_id=None):
    return JsonResponse({'Status':contact_id})
