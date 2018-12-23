from django.contrib import admin
from backend.models.contact import Contact
from backend.models.profile import Profile
from backend.models.message import Message
from backend.models.email_address import EmailAddress
from backend.models.phone_number import PhoneNumber
from backend.models.tracker import Tracker
from backend.models.recipient import Recipient
from backend.models.front_end import FrontEnd
from backend.models.file_item import FileItem
from backend.models.email_validator import EmailValidator

# Register your models here.

admin.site.register(Contact)
admin.site.register(Profile)
admin.site.register(Message)
admin.site.register(EmailAddress)
admin.site.register(PhoneNumber)
admin.site.register(EmailValidator)
admin.site.register(Tracker)
admin.site.register(Recipient)
admin.site.register(FrontEnd)
admin.site.register(FileItem)
