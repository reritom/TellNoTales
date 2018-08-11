from django.conf.urls import url, include
from deadman.views import accounts
from deadman.views.contact import contact
from deadman.views.single_contact import single_contact
from deadman.views.message import message
from deadman.views.single_message import single_message
from deadman.views.notify import notify
from deadman.views.single_notify import single_notify
from deadman.views.verify import verify
from deadman.views.daemon import daemon
from deadman.views.profile import profile
from deadman.views import ajax
from deadman.views import email

app_name = 'deadman'

urlpatterns = [
    url(r'contact/(?P<contact_id>[-\w]+)', single_contact, name='single_contact'),
    url(r'contact', contact, name='contact'),
    url(r'message/(?P<message_id>[-\w]+)', single_message, name='single_message'),
    url(r'message', message, name='message'),
    url(r'notify/(?P<message_id>[-\w]+)', single_notify, name='single_notify'),
    url(r'notify', notify, name='notify'),
    url(r'verify/(?P<tracker_id>[-\w]+)', verify, name='verify'),
    url(r'daemon', daemon, name='daemon'),
    url(r'login', accounts.login_user, name='login_user'),
    url(r'signup', accounts.signup, name='signup'),
    url(r'logout', accounts.logout_user, name='logout_user'),
    url(r'profile', profile, name='profile'),
    url(r'ajax/username', ajax.validate_username, name='validate_username'),
    url(r'ajax/email', ajax.validate_email, name='validate_username'),
    url(r'confirm/email/(?P<validator_id>[-\w]+)', email.email_confirmed, name='email_confirmed'),
    url(r'confirm/resend', email.resend_confirmation_email, name='resend_confirmation')
]
