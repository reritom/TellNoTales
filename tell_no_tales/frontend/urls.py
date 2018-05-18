from frontend.views import start
from django.conf.urls import url, include

app_name = 'frontend'

urlpatterns = [
    url(r'^$', start, name='start'),
]

# TODO add the signup/tracker redirect views. The api will redirect to these
