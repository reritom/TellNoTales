class ResponseObject():
    def __init__(self, data={}, status=None, error_code=None):
        if error_code is not None:
            error = ErrorMapper[error_code]
        else:
            error = None

        self._response = {'data': data, 'status': status, 'error': error}

    def set_data(self, data):
        self._response['data'] = data

    def set_status(self, status):
        self._response['status'] = status

    def set_errors(self, error_code):
        self._response['error'] = ErrorMapper['error_code']

    def get_response(self):
        return self._response

ErrorMapper = {'0000': {'message': 'Unknown error',
                        'suggestion': 'Retry'},
               '0001A': {'message': 'Already logged in',
                        'suggestion': 'Log out before trying to create a new account'},
               '0001B': {'message': 'Already logged in',
                        'suggestion': 'Log out before trying to log in'},
               '0002': {'message': 'This username already exists',
                        'suggestion': 'Please retry with a different username'},
               '0003': {'message': 'Unsuccessful login',
                        'suggestion': 'Please check your details and retry'},
               '0004': {'message': 'Unsupported request method',
                        'suggestion': None},
               '0005': {'message': 'Missing parameter in request',
                        'suggestion': 'Add the key "mode" with either the value "UPDATE" or "REMOVE"'},
               '0006': {'message': 'Contact ID does not exist',
                        'suggestion': 'Re-get the ID and try again. You might have deleted this contact'},
               '0007': {'message': 'Missing parameters',
                        'suggestion': 'Contact requires "email_address", "name", and "phone_number"'},
               '0008': {'message': 'Missing endpoint extension',
                        'suggestion': 'To delete a message, the extension needs to be /message/<message_id>'},
               '0009': {'message': 'Message ID does not exist',
                        'suggestion': 'Re-get the ID and try again. You might have deleted this message'},
               '0010': {'message': 'Missing parameters',
                        'suggestion': 'Message requires "message" (str), "subject" (str), "lifespan" (int) (days), "cutoff" (int) (days) and the optional parameters of "viewable" (bool) and "deletable" (bool)'},
               '0011': {'message': 'Locked message',
                        'suggestion': 'This message cannot be manipulated'},
               '0012': {'message': 'Invalid recipient',
                        'suggestion': 'The recipient parameter needs to be the contact_id from one of your contacts'},
               '0013': {'message': 'Invalid user',
                        'suggestion': 'This message doesn\'t belong to the profile trying to notify it'}}
