from django.contrib.auth.decorators import login_required
from deadman.tools.response_tools import response_ok, response_ko
from deadman.models.profile import Profile
from deadman.models.message import Message
from django.utils.decorators import method_decorator
from django.views import View

@method_decorator(login_required, name='dispatch')
class NotifyView(View):
    def get(self, request):
        user = request.user
        profile = Profile.objects.get_or_create(user=user)[0]

        # Notify all the messages
        messages = Message.objects.filter(profile=profile, expired=False)

        for message in messages:
            message.notify()

        return response_ok({'message':'All messages have been notified'})
