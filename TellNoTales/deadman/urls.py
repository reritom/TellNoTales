from django.conf.urls import url, include
from deadman.views.api import contact, message, notify, accounts, verify, daemon
from deadman.views import views

app_name = 'deadman'

urlpatterns = [
    url(r'^$', views.start, name='start'),
    url(r'api/contact/(?P<contact_id>[-\w]+)', contact.contact, name='contact'),
    url(r'api/contact', contact.contact, name='contact'),
    url(r'api/message/(?P<message_id>[-\w]+)', message.message, name='message'),
    url(r'api/message', message.message, name='message'),
    url(r'api/notify/(?P<message_id>[-\w]+)', notify.notify, name='notify'),
    url(r'api/notify', notify.notify, name='notify'),
    url(r'api/verify/(?P<tracker_id>[-\w]+)', verify.verify, name='verify'),
    url(r'api/daemon', daemon.daemon, name='daemon'),
    url(r'api/login', accounts.login_user, name='login_user'),
    url(r'api/signup', accounts.signup, name='signup'),
    url(r'api/logout', accounts.logout_user, name='logout_user'),
]
