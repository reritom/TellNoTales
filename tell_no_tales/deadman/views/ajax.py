from django.contrib.auth.models import User
from deadman.tools.response_tools import response_ok, response_ko

def validate_username(request):
    username = request.GET.get('username', False)
    if not username:
        return response_ko("No username is request")

    return response_ok({'valid': User.objects.filter(username__iexact=username).exists()})

def validate_email(request):
    email = request.GET.get('email', False)
    if not email:
        return response_ko("No email in request")

    return response_ok({'valid': User.objects.filter(email__iexact=email).exists()})
