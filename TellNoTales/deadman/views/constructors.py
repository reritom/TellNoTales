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
                        'suggestion': None}}
