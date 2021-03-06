from backend.models.profile import Profile
from backend.models.message import Message
from backend.models.contact import Contact
from backend.tools.response_tools import response_ko, response_ok
from django.utils.functional import wraps

def validate_message_id(view):
    @wraps(view)
    def inner(request, message_id):
        print("In validate_message_id")

        # Retrieve or create a profile
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        # Validate that the message id exists (this is done seperate to the next check, for error granularity)
        if not Message.objects.filter(message_id=message_id).exists():
            return response_ko("Invalid message id")

        # Validate that the message id exists AND belongs to the user
        if not Message.objects.filter(message_id=message_id, profile=profile).exists():
            return response_ko("Message does not belong to this user")

        return view(request, message_id)
    return inner

def validate_contact_id(view):
    @wraps(view)
    def inner(request, contact_id):
        print("In validate_contact_id")

        # Retrieve or create a profile
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        # Validate that the contact id exists (this is done seperate to the next check, for error granularity)
        if not Contact.objects.filter(contact_id=contact_id).exists():
            return response_ko("Invalid contact id")

        # Validate that the message id exists AND belongs to the user
        if not Contact.objects.filter(contact_id=contact_id, profile=profile).exists():
            return response_ko("Contact does not belong to this user")

        return view(request, contact_id)
    return inner

def attach_profile(view):
    @wraps(view)
    def inner(request, *args, **kwargs):
        print("In validate_message_id")

        # Retrieve or create a profile
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        return view(request, profile, *args, **kwargs)
    return inner

def profile_validated(view):
    @wraps(view)
    def inner(request, profile, *args, **kwargs):
        print("In validate_message_id")

        # Retrieve or create a profile
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        # Check if profile has been validated
        if not profile.is_validated():
            return response_ko("Profile email address not validated")

        return view(request, profile, *args, **kwargs)
    return inner

