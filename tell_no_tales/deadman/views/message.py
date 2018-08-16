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
from deadman.models.file_item import FileItem

from deadman.tools.serialisers.message_serialiser import MessageSerialiser

from deadman.tools.model_tools import create_contact_revisions
from deadman.tools.response_tools import response_ok, response_ko
from deadman.tools import media_tools
from deadman.tools.core_tools import to_bool
import json, uuid, os

@csrf_exempt
@login_required
def message(request):
    print("In message flow")
    user = request.user
    profile = Profile.objects.get_or_create(user=user)[0]

    if request.method == 'POST':
        print("Creating new message")
        # Check email has been validated
        if not profile.is_validated():
            return response_ko("Profile email address not validated")


        print(request.POST.keys())
        # Create a new message
        if not ('subject' in request.POST and 'message' in request.POST and 'lifespan' in request.POST and 'cutoff' in request.POST and 'recipients' in request.POST):
            # Missing parameters
            return response_ko('Missing parameters, message requires "message" (str), "subject" (str), "lifespan" (int) (days), "cutoff" (int) (days) and the optional parameters of "viewable" (bool) and "deletable" (bool)')

        message = Message.objects.create(profile=profile,
                                         subject=request.POST['subject'],
                                         message=request.POST['message'],
                                         lifespan=request.POST['lifespan'],
                                         cutoff=request.POST['cutoff'],
                                         message_id=Message.create_uuid())

        print(request.POST['recipients'])

        for recipient_obj in json.loads(request.POST['recipients']):
            recipient = recipient_obj['contact_id']
            print("Recipient {0}".format(recipient))
            if Contact.objects.filter(contact_id=recipient).exists():
                contact = Contact.objects.get(contact_id=recipient)
                recipient = Recipient.objects.get_or_create(contact=contact, message=message)
                print("Recipient created for message {0} and contact id {1}".format(message.message_id, contact.contact_id))

        if 'viewable' in request.POST:
            message.set_viewable(to_bool(request.POST['viewable']))

        if 'deletable' in request.POST:
            message.set_deletable(to_bool(request.POST['deletable']))

        if 'locked' in request.POST:
            message.set_locked(to_bool(request.POST['locked']))

            if to_bool(request.POST['locked']):
                create_contact_revisions(message)

        if request.FILES.getlist('attachments'):
            media_path = media_tools.create_media_dir(message.get_id())

            for f in request.FILES.getlist('attachments'):
                file_name, file_type = os.path.splitext(f.name.lower())
                file_path = os.path.join(media_path, f.name)

                # We will create a model to represent this attachment with an ID and store the file under this id
                file_model = FileItem.objects.create(message=message,
                                                     file_id=FileItem.create_uuid(),
                                                     file_type=file_type,
                                                     file_name=file_name)

                with open(os.path.join(media_path, file_model.get_id() + "." + file_type), 'wb') as file:
                    file.write(f.read())
                # # TODO
                pass

        return response_ok({'message': MessageSerialiser.serialise(message)})


    elif request.method == 'GET':
        print("Retrieving all messages")
        # Return all messages for this profile
        messages = Message.objects.filter(profile=profile).order_by('-created')

        list_of_messages = [MessageSerialiser.serialise(message) for message in messages]

        return response_ok({'messages':list_of_messages})

    else:
        return response_ko("Unsupported request method")
