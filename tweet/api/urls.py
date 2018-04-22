from django.conf.urls import url
from .views import TweetListAPIView,TweetCreateAPIView

urlpatterns = [
    url(r'^$', TweetListAPIView.as_view(),name="list"),
    url(r'^create/', TweetCreateAPIView.as_view(),name="create"),
    # url(r'^detail/(?P<pk>\d+)$',TweetDetailView.as_view(),name='detail'),
    # url(r'^update/(?P<pk>\d+)$',TweetUpdateView.as_view(),name='update'),
    # url(r'^delete/(?P<pk>\d+)$',TweetDeleteView.as_view(),name='delete'),
]
