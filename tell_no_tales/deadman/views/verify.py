from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse

from deadman.models.tracker import Tracker

def verify(request, tracker_id):
    print("This is a verification")

    if Tracker.objects.filter(tracker_id=tracker_id).exists():
        tracker = Tracker.objects.get(tracker_id=tracker_id)
        tracker.set_verified()

    else:
        print("Invalid tracker id")

    return JsonResponse({'status':"OK"})
