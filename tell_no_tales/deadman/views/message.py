from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from deadman.models.contact import Contact
from deadman.models.profile import Profile
from deadman.models.message import Message
from deadman.models.email_address import EmailAddress
from deadman.models.phone_number import PhoneNumber
from deadman.models.tracker import Tracker
from deadman.models.recipient import Recipient

from deadman.tools.model_tools import get_message
from deadman.tools.response_tools import response_ok, response_ko
import json, uuid

@csrf_exempt
@login_required
def message(request):
    print("In message flow")
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'POST':
        print("Creating new message")
        # Create a new message
        if not ('subject' in request.POST and 'message' in request.POST and 'lifespan' in request.POST and 'cutoff' in request.POST):
            # Missing parameters
            return response_ko('Missing parameters, message requires "message" (str), "subject" (str), "lifespan" (int) (days), "cutoff" (int) (days) and the optional parameters of "viewable" (bool) and "deletable" (bool)')

        if not Contact.objects.filter(contact_id=request.POST['recipient']).exists():
            # Invalid contact_id
            return response_ko("Invalid recipient id")

        contact = Contact.objects.get(contact_id=request.POST['recipient'])

        message = Message.objects.create(profile=profile,
                                         subject=request.POST['subject'],
                                         message=request.POST['message'],
                                         lifespan=request.POST['lifespan'],
                                         cutoff=request.POST['cutoff'],
                                         message_id=Message.create_uuid())

        recipient = Recipient.objects.get_or_create(contact=contact, message=message)

        if 'viewable' in request.POST:
            message.set_viewable(True if request.POST['viewable'].lower() == 'true' else False)

        if 'deletable' in request.POST:
            message.set_deletable(True if request.POST['deletable'].lower() == 'true' else False)

        return response_ok({'message':get_message(message)})


    elif request.method == 'GET':
        print("Retrieving all messages")
        # Return all messages for this profile
        messages = Message.objects.filter(profile=profile)

        list_of_messages = [get_message(message) for message in messages]

        return response_ok({'messages':list_of_messages})

    else:
        return response_ko("Unsupported request method")
