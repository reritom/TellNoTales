import os, json

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

def load_config():
    # Load a the email and password from a file outside of the repo
    print(os.listdir(os.path.join('..', '..')))
    path_to_config = os.path.join('..', '..', 'non_git_settings.json')
    config = json.load(open(path_to_config))

    global gmail_sender
    gmail_sender = config['gmail_sender']

    global gmail_password
    gmail_password = config['gmail_password']

    return gmail_sender, gmail_password
