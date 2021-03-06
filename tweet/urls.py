from django.conf.urls import url
from .views import (
        TweetListView,
        TweetCreateView,
        TweetDetailView,
        TweetUpdateView,
        TweetDeleteView,
        RetweetView
    )

urlpatterns = [
    url(r'^$', TweetListView.as_view(),name="list"),
    url(r'^create/', TweetCreateView.as_view(),name="create"),
    url(r'^detail/(?P<pk>\d+)$',TweetDetailView.as_view(),name='detail'),
    url(r'^retweet/(?P<pk>\d+)$',RetweetView.as_view(),name='retweet'),
    url(r'^update/(?P<pk>\d+)$',TweetUpdateView.as_view(),name='update'),
    url(r'^delete/(?P<pk>\d+)$',TweetDeleteView.as_view(),name='delete'),
]
