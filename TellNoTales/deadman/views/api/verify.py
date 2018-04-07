from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict

def verify(request, tracker_id):
    print("This is a verification")

    return JsonResponse({'status':"OK"})
