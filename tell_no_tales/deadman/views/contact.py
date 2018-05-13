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

from deadman.tools.model_tools import get_contact
from deadman.tools.constructors import ResponseObject
import json, uuid

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
                                             contact_id=Contact.create_uuid())

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
            contact = Contact.objects.get(contact_id=contact_id, profile=profile)

            if 'new_addresses' in request.POST:
                new_addresses = json.loads(request.POST.get('new_addresses'))
                for new_address in new_addresses:
                    EmailAddress.objects.get_or_create(email=new_address, contact=contact)

            if 'deleted_addresses' in request.POST:
                deleted_addresses = json.loads(request.POST.get('deleted_addresses'))
                for deleted_address in deleted_addresses:
                    if EmailAddress.objects.filter(email=deleted_address, contact=contact).exists():
                        EmailAddress.objects.filter(email=deleted_address, contact=contact).delete()

            if 'new_numbers' in request.POST:
                new_numbers = json.loads(request.POST.get('new_numbers'))
                for new_number in new_numbers:
                    PhoneNumber.objects.get_or_create(number=new_number, contact=contact)

            if 'deleted_numbers' in request.POST:
                deleted_numbers = json.loads(request.POST.get('deleted_numbers'))
                for deleted_number in deleted_numbers:
                    if PhoneNumber.objects.filter(number=deleted_number, contact=contact).exists():
                        PhoneNumber.objects.filter(number=deleted_number, contact=contact).delete()

            if 'name' in request.POST:
                contact.rename(request.POST['name'])

            response = ResponseObject(status=True, data={'contact':get_contact(contact)})
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
