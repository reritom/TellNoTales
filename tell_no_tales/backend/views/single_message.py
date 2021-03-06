from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View

from backend.models.contact import Contact
from backend.models.message import Message
from backend.models.recipient import Recipient
from backend.models.profile import Profile

from backend.tools.serialisers.message_serialiser import MessageSerialiser

from backend.tools.model_tools import create_contact_revisions
from backend.tools.response_tools import response_ok, response_ko
from backend.tools.core_tools import to_bool
from backend.tools.validation.decorators import validate_message_id
from backend.tools import media_tools

import json, uuid

@method_decorator(csrf_exempt, name='dispatch')
@method_decorator(login_required, name='dispatch')
@method_decorator(validate_message_id, name='dispatch')
class SingleMessageView(View):
    def post(self, request, message_id):
        print("Updating a message")
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        # Update or remove a message
        message = Message.objects.get(message_id=message_id)

        if message.is_locked():
            # Locked message
            return response_ko("Locked message, it can't be modified")

        if not message.is_edittable():
            return response_ko("This message can't be editted")

        if 'make_undeletable' in request.POST:
            if isinstance(to_bool(request.POST['make_undeletable']), bool):
                message.set_deletable(not to_bool(request.POST['make_undeletable']))

        if 'make_anonymous' in request.POST:
            if isinstance(to_bool(request.POST['make_anonymous']), bool):
                message.set_anonymous(to_bool(request.POST['make_anonymous']))

        if 'make_hidden' in request.POST:
            if isinstance(to_bool(request.POST['make_hidden']), bool):
                message.set_viewable(not to_bool(request.POST['make_hidden']))

        if 'change_subject' in request.POST:
            if isinstance(request.post['change_subject'], str):
                message.set_subject(request.post['change_subject'])

        if 'change_message' in request.POST:
            if isinstance(request.post['change_message'], str):
                message.set_message(request.post['change_message'])

        if 'new_recipients' in request.POST:
            new_recipients = json.loads(request.POST.get('new_recipients'))
            for new_recipient in new_recipients:
                # If the contact id exists and belongs to the profile, add it as a recipient
                if Contact.objects.filter(profile=profile, contact_id=new_recipient).exists():
                    contact = Contact.objects.get(profile=profile, contact_id=new_recipient)
                    added_recipient = Recipient.objects.get_or_create(contact=contact, message=message)

        if 'deleted_recipients' in request.POST:
            deleted_recipients = json.loads(request.POST.get('deleted_recipients'))
            for deleted_recipient in deleted_recipients:
                # If the contact id exists and belongs to the profile
                if Contact.objects.filter(profile=profile, contact_id=deleted_recipient).exists():
                    contact = Contact.objects.filter(profile=profile, contact_id=deleted_recipient)
                    # If the contact is a recipient of this message
                    if Recipient.objects.filter(contact=contact, message=message).exists():
                        Recipient.objects.filter(contact=contact, message=message).delete()
                        print("Recipient has been deleted {0}".format(deleted_recipient))

        if 'make_locked' in request.POST:
            if isinstance(to_bool(request.POST['make_locked']), bool):
                message.set_locked(to_bool(request.POST['make_locked']))
                # The message is locked, so all the contacts need replacing with ones with versions of the current contact state
                if to_bool(request.POST['make_locked']):
                    create_contact_revisions(message_object=message)

        return response_ok({'message': MessageSerialiser.serialise(message)})

    def get(self, request, message_id):
        print("Returning a specific message")
        # Return the message
        message = Message.objects.get(message_id=message_id)
        return response_ok({'message': MessageSerialiser.serialise(message)})

    def delete(self, request, message_id):
        print("Deleting a message")
        if Message.objects.filter(message_id=message_id).exists():
            message = Message.objects.get(message_id=message_id)

            if message.is_deletable():
                message.delete()
                media_tools.delete_dir(message.get_id())
                return response_ok({'message':"message deleted"})
            else:
                return response_ko("This message is undeletable")

        else:
            return response_ko("Message doesn't exist")

