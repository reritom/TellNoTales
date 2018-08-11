from deadman.models.message import Message

class ProfileSerialiser():
    @staticmethod
    def serialise(profile):
        '''
            This method constructs a profile bom
        '''

        profile_bom = profile.get_profile_as_json()

        messages_delivered = Message.objects.filter(profile=profile, delivered=True).count()
        profile_bom['messages_delivered'] = messages_delivered

        messages_undelivered = Message.objects.filter(profile=profile, delivered=False).count()
        profile_bom['messages_undelivered'] = messages_undelivered

        return profile_bom