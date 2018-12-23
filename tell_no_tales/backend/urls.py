from django.conf.urls import url, include
from backend.views import accounts
from backend.views.contact import ContactView
from backend.views.single_contact import SingleContactView
from backend.views.message import MessageView
from backend.views.single_message import SingleMessageView
from backend.views.notify import NotifyView
from backend.views.single_notify import SingleNotifyView
from backend.views.verify import verify
from backend.views.daemon import daemon
from backend.views.profile import profile
from backend.views import ajax
from backend.views import email

app_name = 'backend'

urlpatterns = [
    url(r'contact/(?P<contact_id>[-\w]+)', SingleContactView.as_view(), name='single_contact'),
    url(r'contact', ContactView.as_view(), name='contact'),
    url(r'message/(?P<message_id>[-\w]+)', SingleMessageView.as_view(), name='single_message'),
    url(r'message', MessageView.as_view(), name='message'),
    url(r'notify/(?P<message_id>[-\w]+)', SingleNotifyView.as_view(), name='single_notify'),
    url(r'notify', NotifyView.as_view(), name='notify'),
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
