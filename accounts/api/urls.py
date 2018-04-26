from django.conf.urls import url
from tweet.api.views import TweetListAPIView

urlpatterns = [
    url(r'^(?P<username>[\w.@+-]+)/$', TweetListAPIView.as_view(),name="list"),
    # url(r'^create/', TweetCreateAPIView.as_view(),name="create"),
    # url(r'^retweet/(?P<pk>\d+)$',RetWeetAPIView.as_view(),name='retweet'),
    # url(r'^update/(?P<pk>\d+)$',TweetUpdateView.as_view(),name='update'),
    # url(r'^delete/(?P<pk>\d+)$',TweetDeleteView.as_view(),name='delete'),
]
