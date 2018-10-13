class SwaggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Before any given request, we compare the request data to swagger definition
        path_extension = request.build_absolute_uri()[len(request.build_absolute_uri('/')[:-1].strip("/")):]
        print("Validating {}".format(path_extension))

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response