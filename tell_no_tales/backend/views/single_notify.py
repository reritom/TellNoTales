from django.contrib.auth.decorators import login_required
from backend.tools.response_tools import response_ok, response_ko
from backend.tools.validation.decorators import validate_message_id
from backend.tools.serialisers.message_serialiser import MessageSerialiser
from backend.models.message import Message
from django.utils.decorators import method_decorator
from django.views import View

@method_decorator(login_required, name='dispatch')
@method_decorator(validate_message_id, name='dispatch')
class SingleNotifyView(View):
    def get(self, request, message_id):
        # Notify a single message
        message = Message.objects.get(message_id=message_id)
        message.notify()
        return response_ok({'message':MessageSerialiser.serialise(message)})

