from frontend.views import start
from django.conf.urls import url, include

app_name = 'frontend'

urlpatterns = [
    url(r'^$', start, name='start'),
]
