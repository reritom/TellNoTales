from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from deadman.models import Contact, Message, Profile

from deadman.views.constructors import ResponseObject
import json, uuid

def create_uuid():
    this_uuid = uuid.uuid4()
    if Message.objects.filter(message_id=this_uuid).exists():
        return create_uuid()
    else:
        return this_uuid


@csrf_exempt
@login_required
def message(request, message_id=None):
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'POST':
        if message_id is None:
            # Create a new message
            if not ('subject' in request.POST and 'message' in request.POST and 'lifespan' in request.POST and 'cutoff' in request.POST):
                # Missing parameters
                response = ResponseObject(status=False, error_code='0010')
                return JsonResponse(response.get_response())

            message = Message.objects.create(profile=profile,
                                             subject=request.POST['subject'],
                                             message=request.POST['message'],
                                             lifespan=request.POST['lifespan'],
                                             cutoff=request.POST['cutoff'],
                                             message_id=create_uuid())


            if not Contact.objects.filter(contact_id=request.POST['recipient']).exists():
                # Invalid contact_id
                response = ResponseObject(status=False, error_code='0012')
                return JsonResponse(response.get_response())

            message.add_recipient(request.POST['recipient'])

            if 'viewable' in request.POST:
                message.set_viewable(True if request.POST['viewable'].lower() == 'true' else False)

            if 'deletable' in request.POST:
                message.set_deletable(True if request.POST['deletable'].lower() == 'true' else False)

            response = ResponseObject(status=True, data={'message':message.as_json()})
            return JsonResponse(response.get_response())

        elif Message.objects.filter(message_id=message_id).exists():
            # Update or remove a message
            message = Message.objects.get(message_id=message_id)

            if message.is_locked():
                # Locked message
                response = ResponseObject(status=False, error_code='0011')
                return JsonResponse(response.get_response())

            if 'mode' not in request.POST:
                response = ResponseObject(status=False, error_code='0005')
                return JsonResponse(response.get_response())

            mode = request.POST['mode']

            if 'recipient' in request.POST:
                if not Contact.objects.filter(contact_id=request.POST['recipient']).exists():
                    # Invalid contact_id
                    response = ResponseObject(status=False, error_code='0012')
                    return JsonResponse(response.get_response())

            if mode == 'UPDATE':
                message.add_recipient(request.POST['recipient'])

            elif mode == 'REMOVE':
                message.remove_recipient(request.POST['recipient'])


            response = ResponseObject(status=True, data={'message':message.as_json()})
            return JsonResponse(response.get_response())

        else:
            # The message_id doesn't exist
            response = ResponseObject(status=False, error_code='0009')
            return JsonResponse(response.get_response())


    if request.method == 'GET':
        if message_id is None:
            # Return all contacts for this profile
            messages = Message.objects.filter(profile=profile)

            list_of_messages = [message.as_json() for message in messages]

            response = ResponseObject(status=True, data={'messages':list_of_messages})
            return JsonResponse(response.get_response())

        elif Message.objects.filter(message_id=message_id).exists():
            # Return the message
            message = Message.objects.get(message_id=message_id)
            response = ResponseObject(status=True, data={'message':message.as_json()})
            return JsonResponse(response.get_response())

        else:
            # The message_id doesn't exist
            response = ResponseObject(status=False, error_code='0009')
            return JsonResponse(response.get_response())

    if request == 'DELETE':
        if message_id is None:
            # The message_id doesn't exist
            response = ResponseObject(status=False, error_code='0008')
            return JsonResponse(response.get_response())

        if Message.objects.filter(message_id=message_id).exists():
            # Delete message
            Message.objects.filter(message_id=message_id).delete()

        else:
            # The message_id doesn't exist
            response = ResponseObject(status=False, error_code='0009')
            return JsonResponse(response.get_response())

    else:
        response = ResponseObject(status=False, error_code='0004')
        return JsonResponse(response.get_response())

    return JsonResponse({'Status':message_id})