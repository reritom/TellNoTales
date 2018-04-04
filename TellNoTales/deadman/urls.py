from django.conf.urls import url, include
from deadman.views.api import contact, message, notify
from deadman.views import views

app_name = 'deadman'

urlpatterns = [
    url(r'^$', views.start, name='start'),
    url(r'contact/(?P<contact_id>[-\w]+)', contact.contact, name='contact'),
    url(r'contact', contact.contact, name='contact'),
    url(r'message/(?P<message_id>[-\w]+)', message.message, name='message'),
    url(r'message', message.message, name='message'),
    url(r'notify/(?P<message_id>[-\w]+)', notify.notify, name='notify'),
    url(r'notify', notify.notify, name='notify'),
    url(r'login', views.login_user, name='login_user'),
    url(r'signup', views.signup, name='signup'),
    url(r'logout', views.logout_user, name='logout_user'),
]