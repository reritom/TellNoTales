from django.contrib import admin
from deadman.models import Contact, Profile, Message, EmailAddress, PhoneNumber, Tracker, Recipient

# Register your models here.

admin.site.register(Contact)
admin.site.register(Profile)
admin.site.register(Message)
admin.site.register(EmailAddress)
admin.site.register(PhoneNumber)
admin.site.register(Tracker)
admin.site.register(Recipient)
