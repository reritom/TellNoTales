from django.http import JsonResponse

def response_ok(response_data):
    '''
        This function expects a dictionary of response data key/values for a successful request
        :param response_data (dict): gets added to the data element in the response
    '''

    response = {'status': True,
                'data': response_data}

    return JsonResponse(response)

def response_ko(error):
    '''
        This function expects an error string and is formatted into a response with status KO
        :param error (str): error description
    '''

    response = {'status': False,
                'error': error}

    print("Response KO: {0}".format(error))

    return JsonResponse(response)
