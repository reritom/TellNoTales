from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User

from deadman.views.constructors import ResponseObject

# Create your views here.

def start(request):
    return render(request, 'deadman/home.html')

@csrf_exempt
def signup(request):
    if request.user.is_authenticated:
        response = ResponseObject(status=False, error_code='0001A')
        return JsonResponse(response.get_response())

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']

        if User.objects.filter(username=username).exists():
            response = ResponseObject(status=False, error_code='0002')
            return JsonResponse(response.get_response())

        user = User.objects.create_user(username=username, email=email, password=password)

    else:
        response = ResponseObject(status=False, error_code='0004')
        return JsonResponse(response.get_response())

@csrf_exempt
def login_user(request):
    if request.user.is_authenticated:
        response = ResponseObject(status=False, error_code='0001B')
        return JsonResponse(response.get_response())

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)

            response = ResponseObject(status=True, data={'message':'User successfully logged in'})
            return JsonResponse(response.get_response())

        else:
            response = ResponseObject(status=False, error_code='0003')
            return JsonResponse(response.get_response())

    else:
        response = ResponseObject(status=False, error_code='0004')
        return JsonResponse(response.get_response())

def logout_user(request):
     logout(request)

     response = ResponseObject(status=True, data={'message':'User successfully logged out'})
     return JsonResponse(response.get_response())
