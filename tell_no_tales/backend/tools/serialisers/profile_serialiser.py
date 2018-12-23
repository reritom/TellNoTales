from backend.models.message import Message

class ProfileSerialiser():
    @staticmethod
    def serialise(profile):
        '''
            This method constructs a profile bom
        '''

        profile_bom = {'username': profile.user.username,
                       'email': profile.user.email,
                       'validated': profile.email_validated}

        messages_delivered = Message.objects.filter(profile=profile, delivered=True).count()
        profile_bom['messages_delivered'] = messages_delivered

        messages_undelivered = Message.objects.filter(profile=profile, delivered=False).count()
        profile_bom['messages_undelivered'] = messages_undelivered

        return profile_bom
