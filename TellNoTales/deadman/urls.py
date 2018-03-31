from django.conf.urls import url, include
from deadman.views import views
from deadman.views import api_views

app_name = 'deadman'

urlpatterns = [
    url(r'^$', views.start, name='start'),
    #url(r'post', views.post, name='post'),
    #url(r'api/(?P<action>\w+)/(?P<action>\w+)', views.load, name='api_projector'),
    #url(r'iaw/', views.cleanup, name='cleanup'),
    url(r'contact/(?P<contact_id>\w+)', api_views.contact, name='contact'),
    url(r'contact', api_views.contact, name='contact'),
    #url(r'create/message', views.cleanup, name='cleanup'),
]
