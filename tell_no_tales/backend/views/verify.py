from backend.models.tracker import Tracker
from backend.tools.response_tools import response_ok, response_ko

def verify(request, tracker_id):
    print("This is a verification")

    if Tracker.objects.filter(tracker_id=tracker_id).exists():
        tracker = Tracker.objects.get(tracker_id=tracker_id)
        tracker.set_verified()
    else:
        return response_ko("Invalid tracker id")

    return response_ok({'message':"verified"})
