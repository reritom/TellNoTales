from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from deadman.models import Contact, Message, Profile

from deadman.views.constructors import ResponseObject
import json, uuid

def create_uuid():
    this_uuid = uuid.uuid4()
    if Contact.objects.filter(contact_id=this_uuid).exists():
        return create_uuid()
    else:
        return this_uuid

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
                                             phone_number=request.POST['phone_number'],
                                             contact_id=create_uuid())

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
