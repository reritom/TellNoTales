from django.contrib.auth.decorators import login_required
from deadman.tools.response_tools import response_ok, response_ko
from deadman.models.profile import Profile
from deadman.models.message import Message

@login_required
def notify(request):
    if request.method == 'GET':
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        # Notify all the messages
        messages = Message.objects.filter(profile=profile)

        for message in messages:
            message.notify()

        return response_ok({'message':'All messages have been notified'})

    else:
        # Unsupported method
        return response_ko("Unsupported request method")
