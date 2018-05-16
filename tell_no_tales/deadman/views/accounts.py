from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

from deadman.tools.response_tools import response_ok, response_ko

@csrf_exempt
def signup(request):
    if request.user.is_authenticated:
        return response_ko("Already logged in")

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']

        # TODO, add field to profile or user "validated", send email with confirmation link

        if User.objects.filter(username=username).exists():
            return response_ko("This username already exists")

        user = User.objects.create_user(username=username, email=email, password=password)

        return response_ok({'message':'User account successfully created'})

    else:
        return response_ko("Unsupported request method")

@csrf_exempt
def login_user(request):
    if request.user.is_authenticated:
        return response_ok({"message": "Already logged in"})

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        if not User.objects.filter(username=username).exists():
            return response_ko("Username doesn't exist")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return response_ok({'message':'User successfully logged in'})
        else:
            return response_ko("Unsuccessful login")

    else:
        return response_ko("Unsupported request method")

def logout_user(request):
     logout(request)
     return response_ok({'message':'User successfully logged out'})
