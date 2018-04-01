from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required

@login_required
def contact(request, contact_id=None):
    return JsonResponse({'Status':contact_id})
