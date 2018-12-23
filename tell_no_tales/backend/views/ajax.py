from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from backend.tools.response_tools import response_ok, response_ko

@csrf_exempt
def validate_username(request):
    username = request.POST.get('username', False)
    if not username:
        return response_ko("No username is request")

    return response_ok({'valid': User.objects.filter(username__iexact=username).exists()})

@csrf_exempt
def validate_email(request):
    email = request.POST.get('email', False)
    if not email:
        return response_ko("No email in request")

    return response_ok({'valid': User.objects.filter(email__iexact=email).exists()})
