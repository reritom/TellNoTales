from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from deadman.models import Contact, Message, Profile

from deadman.views.constructors import ResponseObject
import json

@csrf_exempt
@login_required
def contact(request, contact_id=None):
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'POST':
        if contact_id == None:
            # Create new contact using post data
            if not ('name' in request.POST and 'phone_number' in request.POST and 'email_address' in request.POST):
                response = ResponseObject(status=False, error_code='0007')
                return JsonResponse(response.get_response())

            contact = Contact.objects.create(profile=profile,
                                             name=request.POST['name'],
                                             phone_number=request.POST['phone_number'])

            contact.add_email_address(request.POST['email_address'])

            response = ResponseObject(status=True, data={'contact':contact.get_contact_as_json()})
            return JsonResponse(response.get_response())

        if Contact.objects.filter(contact_id=contact_id).exists():
            # Update and append new data to the contact
            contact = Contact.objects.get(contact_id=contact_id)

            if 'mode' in request.POST and request.POST['mode'] == 'UPDATE':
                if 'email_address' in request.POST:
                    contact.add_email_address(request.POST['email_address'])

                if 'name' in request.POST:
                    contact.rename(request.POST['name'])

                if 'phone_number' in request.POST:
                    contact.update_number(request.POST['phone_number'])

                response = ResponseObject(status=True, data={'contact':contact.get_contact_as_json()})
                return JsonResponse(response.get_response())

            elif 'mode' in request.POST and request.POST['mode'] == 'REMOVE':
                if 'email_address' in request.POST:
                    contact.remove_email_address(request.POST['email_address'])

                response = ResponseObject(status=True, data={'contact':contact.get_contact_as_json()})
                return JsonResponse(response.get_response())

            else:
                response = ResponseObject(status=False, error_code='0005')
                return JsonResponse(response.get_response())

        else:
            # The contact_id doesn't exist
            response = ResponseObject(status=False, error_code='0006')
            return JsonResponse(response.get_response())

    if request.method == 'GET':
        if contact_id is None:
            # Return all contacts for this profile
            contacts = Contact.objects.filter(profile=profile)

            list_of_contacts = [contact.get_contact_as_json() for contact in contacts]

            response = ResponseObject(status=True, data={'contacts':list_of_contacts})
            return JsonResponse(response.get_response())

        elif Contact.objects.filter(contact_id=contact_id).exists():
            # Return the contact
            contact = Contact.objects.get(contact_id=contact_id)
            response = ResponseObject(status=True, data={'contact':contact.get_contact_as_json()})
            return JsonResponse(response.get_response())

        else:
            # The contact_id doesn't exist
            response = ResponseObject(status=False, error_code='0006')
            return JsonResponse(response.get_response())

    if request.method == 'DELETE':
        if Contact.objects.filter(contact_id=contact_id).exists():
            # Delete contact (But remain accessable to preexisting messages)
            Contact.objects.filter(contact_id=contact_id).delete()

        else:
            # The contact_id doesn't exist
            response = ResponseObject(status=False, error_code='0006')
            return JsonResponse(response.get_response())

        response = ResponseObject(status=True, data={'message':'Contact has been deleted'})
        return JsonResponse(response.get_response())

    return JsonResponse({'Status':contact_id})

@csrf_exempt
@login_required
def message(request, message_id=None):
    '''
        If POST and message_id == None:
            Create new message using post data
        If GET and message_id is None:
            Return all messages for this profile
        If GET and message_id is valid:
            Return the message
        If PUT and message_id is valid:
            Update and append new data to the contact (if updateable message)
        If DELETE and message_id is valid:
            Delete message if deletable

    '''
    return JsonResponse({'Status':message_id})

@login_required
def notify(request, message_id=None):
    '''
        If GET and message_id is None:
            Notify all the messages for this profile
        If GET and message_id is valid:
            Notify only for this message

    '''
    return JsonResponse({'Status':message_id})
