from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from deadman.models import Contact, Message, Profile

from deadman.views.constructors import ResponseObject
import json


@login_required
def notify(request, message_id=None):
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'GET':
        if message_id is None:
            # Notify all the messages
            messages = Message.objects.filter(profile=profile)

            for message in messages:
                message.notify()

            response = ResponseObject(status=True, data={'message':'All messages have been notified'})
            return JsonResponse(response.get_response())

        elif Message.objects.filter(message_id=message_id).exists():
            # Notify a single message
            message = Message.objects.get(message_id=message_id)

            # Check that the message belongs to the profile which is trying to notify it
            if message.profile == profile:
                message.notify()

                response = ResponseObject(status=True, data={'message':message.as_json()})
                return JsonResponse(response.get_response())

            else:
                # Profile doesn't match that of the message
                response = ResponseObject(status=False, error_code='0013')
                return JsonResponse(response.get_response())

        else:
            # The message_id doesn't exist
            response = ResponseObject(status=False, error_code='0009')
            return JsonResponse(response.get_response())

    else:
        # Unsupported method
        response = ResponseObject(status=False, error_code='0004')
        return JsonResponse(response.get_response())

    return JsonResponse({'Status':message_id})
