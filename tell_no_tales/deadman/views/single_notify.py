from django.contrib.auth.decorators import login_required
from deadman.tools.response_tools import response_ok, response_ko
from deadman.tools.validation.decorators import validate_message_id
from deadman.tools.serialisers.message_serialiser import MessageSerialiser
from deadman.models.message import Message

@login_required
@validate_message_id
def single_notify(request, message_id):
    if request.method == 'GET':
        # Notify a single message
        message = Message.objects.get(message_id=message_id)
        message.notify()
        return response_ok({'message':MessageSerialiser.serialise(message)})
    else:
        # Unsupported method
        return response_ko("Unsupported request method")
