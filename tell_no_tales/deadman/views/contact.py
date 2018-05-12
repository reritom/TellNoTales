from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, QueryDict
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.message import Message
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.tracker import Tracker
from deadman.models.recipient import Recipient

from deadman.helpers.model_tools import get_contact
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

            print(request.POST)
            if not ('name' in request.POST and 'phone_number' in request.POST and 'email_address' in request.POST):
                response = ResponseObject(status=False, error_code='0007')
                return JsonResponse(response.get_response())

            contact = Contact.objects.create(profile=profile,
                                             name=request.POST['name'],
                                             contact_id=create_uuid())

            if not isinstance(request.POST['phone_number'], str):
                return JsonResponse({'nope':'phone number needs to be a string'})

            number = PhoneNumber.objects.create(number=request.POST['phone_number'], contact=contact)

            if not isinstance(request.POST['email_address'], str):
                return JsonResponse({'nope':'email_address needs to be a string'})

            email = EmailAddress.objects.create(email=request.POST['email_address'], contact=contact)

            response = ResponseObject(status=True, data={'contact':get_contact(contact)})
            return JsonResponse(response.get_response())

        if Contact.objects.filter(contact_id=contact_id).exists():
            # Update and append new data to the contact
            contact = Contact.objects.get(contact_id=contact_id)

            if not profile == contact.profile:
                # Profile doesn't match that of the message
                response = ResponseObject(status=False, error_code='0013')
                return JsonResponse(response.get_response())

            if 'mode' in request.POST and request.POST['mode'] == 'UPDATE':
                if 'email_address' in request.POST:
                    EmailAddress.objects.get_or_create(email=request.POST['email_address'], contact=contact)

                if 'name' in request.POST:
                    contact.rename(request.POST['name'])

                if 'phone_number' in request.POST:
                    PhoneNumber.objects.get_or_create(number=request.POST['phone_number'], contact=contact)

                response = ResponseObject(status=True, data={'contact':get_contact(contact)})
                return JsonResponse(response.get_response())

            elif 'mode' in request.POST and request.POST['mode'] == 'REMOVE':
                if 'email_address' in request.POST:
                    if EmailAddress.objects.filter(email=request.POST['email_address'], contact=contact).exists():
                        EmailAddress.objects.filter(email=request.POST['email_address'], contact=contact).delete()

                if 'phone_number' in request.POST:
                    if PhoneNumber.objects.filter(number=request.POST['phone_number'], contact=contact).exists():
                        PhoneNumber.objects.filter(number=request.POST['phone_number'], contact=contact).delete()

                response = ResponseObject(status=True, data={'contact':get_contact(contact)})
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

            list_of_contacts = [get_contact(contact) for contact in contacts]

            response = ResponseObject(status=True, data={'contacts':list_of_contacts})
            return JsonResponse(response.get_response())

        elif Contact.objects.filter(contact_id=contact_id).exists():
            # Return the contact
            contact = Contact.objects.get(contact_id=contact_id)
            response = ResponseObject(status=True, data={'contact':get_contact(contact)})
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
