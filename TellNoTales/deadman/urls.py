from django.conf.urls import url, include
from deadman.views.api import contact, message, notify, accounts, verify, daemon
from deadman.views import views

app_name = 'deadman'

urlpatterns = [
    url(r'^$', views.start, name='start'),
    url(r'contact/(?P<contact_id>[-\w]+)', contact.contact, name='contact'),
    url(r'contact', contact.contact, name='contact'),
    url(r'message/(?P<message_id>[-\w]+)', message.message, name='message'),
    url(r'api/message', message.message, name='message'),
    url(r'notify/(?P<message_id>[-\w]+)', notify.notify, name='notify'),
    url(r'notify', notify.notify, name='notify'),
    url(r'verify/(?P<tracker_id>[-\w]+)', verify.verify, name='verify'),
    url(r'daemon', daemon.daemon, name='daemon'),
    url(r'api/login', accounts.login_user, name='login_user'),
    url(r'signup', accounts.signup, name='signup'),
    url(r'logout', accounts.logout_user, name='logout_user'),
]
