from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from deadman.models import Contact, Message, Profile

from deadman.views.constructors import ResponseObject
import json


@login_required
def notify(request, message_id=None):
    '''
        If GET and message_id is None:
            Notify all the messages for this profile
        If GET and message_id is valid:
            Notify only for this message

    '''
    return JsonResponse({'Status':message_id})
