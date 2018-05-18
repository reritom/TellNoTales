def to_bool(value):
    '''
        This method takes a string and returns either True, False, or None, depending on the conversion
    '''


    if value.lower() == 'true':
        return True

    elif value.lower() == 'false':
        return False

    else:
        return None
